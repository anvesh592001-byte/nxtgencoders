import Link from "next/link";
import { AuthFrame } from "@/components/auth-frame";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { ErrorNote } from "@/components/error-note";
import { forgotPassword } from "@/app/actions";

export const metadata={title:"Account Recovery"};

export default async function Forgot({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){
 const p=await searchParams;
 return <AuthFrame eyebrow="Administrator-assisted recovery" title="Recover access." description="NXTGENCODERS does not send password-reset email. Submit your account email, then contact an administrator to verify your identity and receive a temporary password." foot={<Link href="/login" className="font-bold text-lime">Return to login</Link>}>
  <ErrorNote message={p.error}/>
  {p.message&&<div role="status" className="mb-5 border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-lime">{p.message}</div>}
  <form action={forgotPassword} className="space-y-5"><label><span className="label">Account email</span><input className="field" type="email" name="email" autoComplete="email" required/></label><p className="text-xs leading-5 text-zinc-500">For privacy, the confirmation is identical whether or not an account exists.</p><AuthSubmitButton label="Request administrator help" pendingLabel="Submitting…"/></form>
 </AuthFrame>;
}
