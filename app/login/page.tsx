import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { AuthFrame } from "@/components/auth-frame";
import { ErrorNote } from "@/components/error-note";
import { LoginForm } from "@/components/login-form";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { createClient } from "@/lib/supabase/server";
import { googleAuthEnabled } from "@/lib/supabase/auth-settings";

export const metadata={title:"Sign In"};

export default async function Login({searchParams}:{searchParams:Promise<{error?:string;message?:string;next?:string}>}){
 const p=await searchParams;
 const requested=p.next||"/";const next=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/";
 const s=await createClient();if(s){const {data:{user}}=await s.auth.getUser();if(user)redirect(next);}
 const googleEnabled=await googleAuthEnabled();
 return <AuthFrame eyebrow="Student access // Secure session" title="Welcome back, builder." description="Continue your ideas, discussions, projects, and community work." foot={<>New to the network? <Link href="/signup" className="font-bold text-lime transition hover:text-purple">Create an account</Link></>}>
  <div className="auth-card border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
   <div className="mb-5 flex items-start gap-3 border-b border-zinc-800 pb-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center bg-deep text-purple"><KeyRound size={19}/></span><div><h2 className="font-display text-lg font-black uppercase">Verified access</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Your session is protected by Supabase Auth and secure server cookies.</p></div></div>
   <ErrorNote message={p.error}/>
   {p.message&&<div role="status" className="mb-5 flex gap-2 border border-lime/40 bg-lime/10 p-3 text-sm text-lime"><CheckCircle2 className="mt-0.5 shrink-0" size={16}/><span>{p.message}</span></div>}
   {googleEnabled&&<><GoogleSignInButton next={next}/><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-zinc-800"/><span className="font-mono text-[8px] font-bold uppercase tracking-widest text-zinc-600">or use email</span><span className="h-px flex-1 bg-zinc-800"/></div></>}
   <LoginForm next={next}/>
   <div className="mt-4 flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 font-mono text-[8px] uppercase text-zinc-600"><ShieldCheck size={12}/>Encrypted session</span><Link href="/forgot-password" className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 transition hover:text-purple">Forgot password?</Link></div>
  </div>
 </AuthFrame>;
}
