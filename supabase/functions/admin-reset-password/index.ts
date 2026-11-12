import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://nxtgencoders.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceKey || !authorization) {
    return reply(401, { error: "Unauthorized" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return reply(401, { error: "Unauthorized" });

  const { data: adminProfile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (adminProfile?.role !== "admin") return reply(403, { error: "Administrator access required" });

  let payload: { request_id?: unknown; temporary_password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return reply(400, { error: "Invalid request" });
  }
  const requestId = typeof payload.request_id === "string" ? payload.request_id : "";
  const password = typeof payload.temporary_password === "string" ? payload.temporary_password : "";
  const strongEnough = password.length >= 12 && password.length <= 128 &&
    /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
  if (!requestId || !strongEnough) {
    return reply(400, { error: "Use a temporary password of 12–128 characters with upper, lower, and numeric characters." });
  }

  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: recovery, error: recoveryError } = await serviceClient
    .from("account_recovery_requests")
    .select("id,user_id,status")
    .eq("id", requestId)
    .maybeSingle();
  if (recoveryError || !recovery || recovery.status !== "pending") {
    return reply(404, { error: "Pending recovery request not found" });
  }

  const { error: passwordError } = await serviceClient.auth.admin.updateUserById(
    recovery.user_id,
    { password },
  );
  if (passwordError) return reply(400, { error: "Password could not be reset" });

  const { error: updateError } = await serviceClient
    .from("account_recovery_requests")
    .update({ status: "completed", handled_at: new Date().toISOString(), handled_by: authData.user.id })
    .eq("id", recovery.id)
    .eq("status", "pending");
  if (updateError) return reply(500, { error: "Password changed, but the request could not be closed" });

  return reply(200, { ok: true });
});
