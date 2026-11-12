import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthFrame } from "@/components/auth-frame";
import { ErrorNote } from "@/components/error-note";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { resendVerification } from "@/app/actions";

export const metadata={title:"Verify Email"};

function maskEmail(email:string){
 const [name,domain]=email.split("@");
 if(!name||!domain)return "your email address";
 return `${name.slice(0,2)}${"•".repeat(Math.min(Math.max(name.length-2,2),6))}@${domain}`;
}

export default async function CheckEmail({searchParams}:{searchParams:Promise<{email?:string;error?:string;message?:string}>}){
 const p=await searchParams;
 const email=(p.email||"").trim().toLowerCase();
 return <AuthFrame eyebrow="Verification checkpoint" title="Check your inbox." description={`Open the verification link sent to ${maskEmail(email)}. After verification, you can sign in from any device.`} foot={<>Already verified? <Link href="/login" className="font-bold text-lime">Sign in</Link></>}>
  <div className="auth-card border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
   <div className="mb-5 flex items-start gap-3 border-b border-zinc-800 pb-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center bg-deep text-purple"><MailCheck size={19}/></span><div><h2 className="font-display text-lg font-black uppercase">One final step</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Use the newest email only. Older verification links may no longer be valid.</p></div></div>
   <ErrorNote message={p.error}/>
   {p.message&&<div role="status" className="mb-5 border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-lime">{p.message}</div>}
   <form action={resendVerification} className="space-y-4">
    {email?<input type="hidden" name="email" value={email}/>:<label><span className="label">Email address</span><input className="field" type="email" name="email" autoComplete="email" required/></label>}
    <AuthSubmitButton label="Resend verification email" pendingLabel="Sending…"/>
   </form>
   <p className="mt-4 text-xs leading-5 text-zinc-600">Check spam or promotions before resending. Repeated requests are rate-limited for security.</p>
  </div>
 </AuthFrame>;
}
