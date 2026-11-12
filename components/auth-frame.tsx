import Link from "next/link";
import { Code2, Lightbulb, MessageCircle, Rocket, Zap } from "lucide-react";
import { AppearanceControls } from "./appearance-controls";

export function AuthFrame({eyebrow,title,description,children,foot}:{eyebrow:string;title:string;description:string;children:React.ReactNode;foot:React.ReactNode}){
 return <main className="doodle-bg grain relative grid min-h-screen bg-zinc-950 lg:grid-cols-[.9fr_1.1fr]">
  <div className="absolute right-4 top-4 z-30"><AppearanceControls/></div>
  <section className="auth-visual relative hidden min-h-screen overflow-hidden border-r border-zinc-800 bg-deep p-10 lg:flex lg:flex-col xl:p-14"><div className="halftone absolute inset-0 opacity-30"/><Link href="/" className="relative flex items-center gap-3 font-display text-lg font-black"><span className="flex h-10 w-10 -skew-x-6 items-center justify-center bg-lime text-ink"><Zap fill="currentColor"/></span>NXTGEN<span className="-ml-3 text-purple">CODERS</span></Link>
   <div className="relative my-auto max-w-xl"><p className="eyebrow">Think it. Share it. Build it.</p><h2 className="display-title mt-5 text-6xl xl:text-7xl">Your builder identity lives here.</h2><p className="mt-7 max-w-lg text-base leading-7 text-lavender/70">Return to your ideas, public discussions, project teams, and verified contribution history.</p><div className="mt-9 grid grid-cols-2 gap-3"><Feature icon={<Lightbulb/>} label="Share ideas"/><Feature icon={<MessageCircle/>} label="Join discussions"/><Feature icon={<Code2/>} label="Build projects"/><Feature icon={<Rocket/>} label="Ship outcomes"/></div></div>
   <div className="relative flex items-center justify-between border-t border-purple/30 pt-5 font-mono text-[8px] uppercase tracking-widest text-zinc-500"><span>NIAT student network</span><span className="text-lime">Secure access // Live</span></div>
  </section>
  <section className="flex items-center justify-center p-5 py-20 sm:p-10 lg:p-12"><div className="smooth-enter w-full max-w-lg"><Link href="/" className="mb-10 inline-flex items-center gap-2 font-display text-sm font-black lg:hidden"><Zap size={20} className="text-lime"/>NXTGENCODERS</Link><p className="eyebrow">{eyebrow}</p><h1 className="mt-3 max-w-md font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">{title}</h1><p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">{description}</p><div className="mt-8">{children}</div><div className="mt-7 border-t border-zinc-800 pt-5 text-center text-xs text-zinc-500">{foot}</div></div></section>
 </main>;
}

function Feature({icon,label}:{icon:React.ReactNode;label:string}){return <div className="flex items-center gap-3 border border-purple/25 bg-purple/10 p-3"><span className="text-lime [&>svg]:h-4 [&>svg]:w-4">{icon}</span><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-lavender">{label}</span></div>}
