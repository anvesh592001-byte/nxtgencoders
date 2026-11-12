import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SectionHeading({ index, title, href, action="View all" }: { index:string; title:string; href?:string; action?:string }) {
 return <div className="mb-5 flex items-end justify-between border-b border-zinc-800 pb-3">
   <div className="flex items-baseline gap-3"><span className="font-mono text-[10px] text-purple">/{index}</span><h2 className="font-display text-xl font-black uppercase tracking-tight sm:text-2xl">{title}</h2></div>
   {href && <Link href={href} className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition hover:text-lime">{action}<ArrowUpRight size={13}/></Link>}
 </div>;
}
