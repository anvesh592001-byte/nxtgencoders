import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { supabaseConfigured } from "./config";

export async function createClient() {
  if (!supabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(items: { name: string; value: string; options?: any }[]) {
          try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Server components cannot write cookies. Middleware refreshes sessions. */ }
        },
      },
    }
  );
}

/**
 * Current user, deduplicated per request. Layout and data helpers each used
 * to call auth.getUser() separately (2-3 network round trips per page load);
 * React cache() collapses them into a single call.
 */
export const getServerUser = cache(async () => {
  const s = await createClient();
  if (!s) return null;
  const { data: { user } } = await s.auth.getUser();
  return user;
});
