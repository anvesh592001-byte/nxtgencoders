import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request:Request){const {searchParams,origin}=new URL(request.url);const code=searchParams.get("code");const next=searchParams.get("next")||"/";if(code){const s=await createClient();const {error}=await s!.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(`${origin}${next}`);}return NextResponse.redirect(`${origin}/login?error=Could%20not%20verify%20account`);}
