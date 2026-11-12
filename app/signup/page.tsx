import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { ErrorNote } from "@/components/error-note";
import { signUp } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata={title:"Create Account"};

const sections=["Section 1","Section 2","Section 3","Section 4","Section 5"];

export default async function Signup({searchParams}:{searchParams:Promise<{error?:string}>}){
 const p=await searchParams;
 const s=await createClient();
 if(s){const {data:{user}}=await s.auth.getUser();if(user)redirect("/");}
 const domains=(process.env.NIAT_ALLOWED_EMAIL_DOMAINS||"").split(",").map(value=>value.trim()).filter(Boolean);
 return <AuthFrame eyebrow="Join signal // 02" title="Claim your place." description={domains.length?`Registration is restricted to ${domains.join(", ")} addresses. No email verification is required.`:"Create your account immediately. An administrator reviews new student profiles before community contributions are enabled."} foot={<>Already registered? <Link href="/login" className="font-bold text-lime">Sign in</Link></>}>
  <ErrorNote message={p.error}/>
  <form action={signUp} className="space-y-4">
   <label><span className="label">Full name</span><input className="field" name="display_name" autoComplete="name" required minLength={2} maxLength={60}/></label>
   <label><span className="label">Email address</span><input className="field" type="email" name="email" autoComplete="email" inputMode="email" required/></label>
   <label><span className="label">Password</span><input className="field" type="password" name="password" autoComplete="new-password" required minLength={8} maxLength={128}/><span className="mt-1 block text-[10px] text-zinc-600">At least 8 characters. Your password is handled only by Supabase Auth.</span></label>
   <label><span className="label">Section</span><select className="field" name="section" required defaultValue=""><option value="" disabled>Select your section</option>{sections.map(section=><option key={section} value={section}>{section}</option>)}</select></label>
   <label className="flex items-start gap-3 text-xs leading-5 text-zinc-500"><input type="checkbox" required className="mt-1 accent-purple"/>I will follow the community guidelines: constructive criticism, originality, collaboration, and respect.</label>
   <AuthSubmitButton label="Create account" pendingLabel="Creating account…"/>
  </form>
 </AuthFrame>;
}
