import Link from "next/link";
import { ArrowBigUp, MessageSquare, MoveUpRight } from "lucide-react";
import type { Idea } from "@/lib/data";
import { Avatar } from "./ui/avatar";
import { timeAgo } from "@/lib/utils";

export function IdeaCard({idea,index,featured=false}:{idea:Idea;index?:number;featured?:boolean}){
 return <article className={`editorial-shadow group relative overflow-hidden border bg-zinc-950 transition-all hover:-translate-y-1 hover:border-purple ${featured?"border-purple/70":"border-zinc-800"}`}>
  {typeof index==="number"&&<div className="absolute right-3 top-1 font-display text-6xl font-black text-white/[.04]">{String(index).padStart(2,"0")}</div>}
  <div className="p-5 sm:p-6">
   <div className="mb-5 flex items-center gap-2"><Avatar name={idea.author_name} url={idea.avatar_url} size="sm"/><div><Link href={`/profile/${idea.author_username}`} className="block text-[11px] font-bold hover:text-lime">{idea.author_name}</Link><span className="font-mono text-[8px] uppercase text-zinc-600">{timeAgo(idea.created_at)}</span></div></div>
   <Link href={`/ideas/${idea.id}`}><h3 className="font-display text-xl font-black leading-tight tracking-tight transition group-hover:text-lavender sm:text-2xl">{idea.title}</h3></Link>
   <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-zinc-500">{idea.short_description}</p>
  </div>
  <div className="flex items-center border-t border-zinc-800"><div className="flex items-center gap-1 border-r border-zinc-800 px-4 py-3 font-mono text-xs font-bold text-lime"><ArrowBigUp size={16}/>{idea.vote_score||0}</div><div className="flex items-center gap-1 px-4 py-3 font-mono text-[10px] text-zinc-500"><MessageSquare size={14}/>{idea.comment_count||0} comments</div><Link aria-label={`View ${idea.title} and comments`} href={`/ideas/${idea.id}`} className="m-2 ml-auto border border-zinc-800 p-2 text-zinc-500 transition hover:border-purple hover:text-white"><MoveUpRight size={14}/></Link></div>
 </article>;
}
