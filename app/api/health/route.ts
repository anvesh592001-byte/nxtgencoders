import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
export async function GET(){let database="not_configured";if(supabaseConfigured){const s=await createClient();const {error}=await s!.from("profiles").select("id",{head:true,count:"exact"});database=error?"error":"connected";}return Response.json({ok:true,service:"nxtgencoders",database,timestamp:new Date().toISOString()});}
