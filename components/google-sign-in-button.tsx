"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({next="/"}:{next?:string}){
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/";
 const signIn=async()=>{
  const supabase=createClient();
  if(!supabase){setError("Sign in is temporarily unavailable.");return;}
  setPending(true);setError("");
  const redirectTo=`${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  const {error:authError}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo}});
  if(authError){setError("Google sign in could not start. Please try again.");setPending(false);}
 };
 return <div>
  <button type="button" onClick={signIn} disabled={pending} className="flex w-full items-center justify-center gap-3 border border-zinc-700 bg-white px-4 py-3 text-sm font-bold text-zinc-900 transition hover:border-purple hover:bg-zinc-100 disabled:cursor-wait disabled:opacity-70">
   {pending?<LoaderCircle className="animate-spin" size={18}/>:<GoogleIcon/>}{pending?"Opening Google…":"Continue with Google"}
  </button>
  {error&&<p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
 </div>;
}

function GoogleIcon(){return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.37l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.93A6.01 6.01 0 0 1 6.08 12c0-.67.12-1.32.32-1.93V7.45H3.06A10 10 0 0 0 2 12c0 1.63.39 3.17 1.06 4.55l3.34-2.62Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.86A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.94 5.45l3.34 2.62c.8-2.36 3-4.12 5.6-4.12Z"/></svg>}
