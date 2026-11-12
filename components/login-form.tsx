"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "@/app/actions";
import { Button } from "./ui/button";

export function LoginForm({next="/"}:{next?:string}){
 const [showPassword,setShowPassword]=useState(false);
 const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/";
 return <form action={signIn} className="space-y-5">
  <input type="hidden" name="next" value={safeNext}/>
  <label className="block"><span className="label">Email address</span><span className="field-shell flex items-center border border-zinc-700 bg-zinc-950 focus-within:border-purple"><Mail size={16} className="ml-4 shrink-0 text-zinc-600"/><input className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600" type="email" name="email" autoComplete="email" inputMode="email" required placeholder="you@example.edu"/></span></label>
  <label className="block"><span className="label">Password</span><span className="field-shell flex items-center border border-zinc-700 bg-zinc-950 focus-within:border-purple"><LockKeyhole size={16} className="ml-4 shrink-0 text-zinc-600"/><input className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none" type={showPassword?"text":"password"} name="password" autoComplete="current-password" required minLength={8}/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"Hide password":"Show password"} className="mr-2 p-2 text-zinc-600 transition hover:text-purple">{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>
  <SubmitButton/>
 </form>;
}

function SubmitButton(){const {pending}=useFormStatus();return <Button type="submit" className="w-full" disabled={pending}>{pending?<><LoaderCircle className="animate-spin" size={15}/>Signing in…</>:<>Enter the network<ArrowRight size={15}/></>}</Button>}
