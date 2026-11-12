import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthFrame } from "@/components/auth-frame";

export const metadata={title:"Email Verification Disabled"};

export default function CheckEmail(){
 return <AuthFrame eyebrow="Immediate account access" title="No email verification." description="NXTGENCODERS no longer sends signup verification messages. New email/password registrations receive a secure session immediately and then wait for administrator profile approval." foot={<Link href="/login" className="font-bold text-lime">Return to sign in</Link>}>
  <div className="auth-card border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
   <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center bg-deep text-lime"><ShieldCheck size={19}/></span><div><h2 className="font-display text-lg font-black uppercase">Email delivery is not required</h2><p className="mt-1 text-xs leading-5 text-zinc-500">If you already registered, sign in with your email and password. For lost-password help, use the administrator-assisted recovery page.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/login" className="font-mono text-[9px] font-bold uppercase text-lime">Sign in</Link><Link href="/forgot-password" className="font-mono text-[9px] font-bold uppercase text-purple">Recover access</Link></div></div></div>
  </div>
 </AuthFrame>;
}
