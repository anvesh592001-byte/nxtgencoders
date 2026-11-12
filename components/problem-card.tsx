import Link from "next/link";
import { ArrowUpRight, Lightbulb, MessageCircle } from "lucide-react";
import type { Problem } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export function ProblemCard({problem}:{problem:Problem}){
 return <article className="editorial-shadow group border border-zinc-800 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-lime/60">
  <Link href={`/problems/${problem.id}`}><h3 className="font-display text-xl font-black leading-tight group-hover:text-lime">{problem.title}</h3></Link>
  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-zinc-500">{problem.description}</p>
  <div className="mt-5 flex items-center gap-4 border-t border-zinc-800 pt-4 font-mono text-[9px] uppercase text-zinc-600"><span className="flex items-center gap-1"><MessageCircle size={14}/>{problem.comment_count||0} comments</span><span className="flex items-center gap-1"><Lightbulb size={14}/>{problem.solution_count||0} solutions</span><span className="ml-auto">{timeAgo(problem.created_at)}</span><ArrowUpRight size={14}/></div>
 </article>;
}
