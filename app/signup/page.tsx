import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { ErrorNote } from "@/components/error-note";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { signUp } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { googleAuthEnabled } from "@/lib/supabase/auth-settings";

export const metadata={title:"Create Account"};

export default async function Signup({searchParams}:{searchParams:Promise<{error?:string}>}){
 const p=await searchParams;
 const s=await createClient();
 if(s){const {data:{user}}=await s.auth.getUser();if(user)redirect("/");}
 const domains=(process.env.NIAT_ALLOWED_EMAIL_DOMAINS||"").split(",").map(value=>value.trim()).filter(Boolean);
 const googleEnabled=await googleAuthEnabled();
 return <AuthFrame eyebrow="Join signal // 02" title="Claim your place." description={domains.length?`Registration is restricted to verified ${domains.join(", ")} addresses.`:"Verify your email first. New registrations then remain pending until an administrator approves them."} foot={<>Already registered? <Link href="/login" className="font-bold text-lime">Sign in</Link></>}>
  <ErrorNote message={p.error}/>
  {googleEnabled&&<><GoogleSignInButton/><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-zinc-800"/><span className="font-mono text-[8px] font-bold uppercase tracking-widest text-zinc-600">or register with email</span><span className="h-px flex-1 bg-zinc-800"/></div></>}
  <form action={signUp} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-2"><label><span className="label">Display name</span><input className="field" name="display_name" autoComplete="name" required minLength={2} maxLength={60}/></label><label><span className="label">Username</span><input className="field" name="username" autoComplete="username" required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]+" placeholder="your_handle"/></label></div>
   <label><span className="label">Student email</span><input className="field" type="email" name="email" autoComplete="email" required/></label>
   <label><span className="label">Password</span><input className="field" type="password" name="password" autoComplete="new-password" required minLength={8}/><span className="mt-1 block text-[10px] text-zinc-600">At least 8 characters.</span></label>
   <label className="flex items-start gap-3 text-xs leading-5 text-zinc-500"><input type="checkbox" required className="mt-1 accent-purple"/>I will follow the community guidelines: constructive criticism, originality, collaboration, and respect.</label>
   <AuthSubmitButton label="Create account" pendingLabel="Creating account…"/>
  </form>
 </AuthFrame>;
}
