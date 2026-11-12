import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request:Request){
 const {searchParams,origin}=new URL(request.url);
 const code=searchParams.get("code");
 const requested=searchParams.get("next")||"/";
 const next=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/";
 if(code){
  const s=await createClient();
  const {error}=await s!.auth.exchangeCodeForSession(code);
  if(!error)return NextResponse.redirect(`${origin}${next}`);
 }
 return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("This verification link is invalid or expired. Request a new email and try again.")}`);
}
