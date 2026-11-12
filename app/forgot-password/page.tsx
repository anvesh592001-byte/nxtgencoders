import Link from "next/link";
import { AuthFrame } from "@/components/auth-frame";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { ErrorNote } from "@/components/error-note";
import { forgotPassword } from "@/app/actions";

export const metadata={title:"Reset Password"};

export default async function Forgot({searchParams}:{searchParams:Promise<{error?:string}>}){
 const p=await searchParams;
 return <AuthFrame eyebrow="Recovery protocol" title="Reset access." description="We will send a secure password reset link to your verified email." foot={<Link href="/login" className="font-bold text-lime">Return to login</Link>}>
  <ErrorNote message={p.error}/>
  <form action={forgotPassword} className="space-y-5"><label><span className="label">Email address</span><input className="field" type="email" name="email" autoComplete="email" required/></label><AuthSubmitButton label="Send reset link" pendingLabel="Sending…"/></form>
 </AuthFrame>;
}
