import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export async function GET(){
 let database="not_configured";
 let detail:string|undefined;
 if(supabaseConfigured){
  const s=await createClient();
  const {error}=await s!.from("profiles").select("id").limit(1);
  database=error?"error":"connected";
  if(error)detail=error.code||"query_failed";
 }
 return Response.json({ok:database==="connected",service:"nxtgencoders",database,...(detail?{detail}:{}),timestamp:new Date().toISOString()},{status:database==="connected"?200:503});
}
