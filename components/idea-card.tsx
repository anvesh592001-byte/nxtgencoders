"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowBigUp, MoveUpRight } from "lucide-react";
import type { Idea } from "@/lib/data";
import { Avatar } from "./ui/avatar";
import { timeAgo } from "@/lib/utils";
import { LikeButton } from "./like-button";
import { IdeaOwnerControls } from "./idea-owner-controls";
import { IdeaComments } from "./idea-comments";

export function IdeaCard({idea,index,featured=false}:{idea:Idea;index?:number;featured?:boolean}){
 const router=useRouter();
 const [deleted,setDeleted]=useState(false);
 const timer=useRef<number|null>(null);
 useEffect(()=>()=>{if(timer.current)window.clearTimeout(timer.current)},[]);
 // Animate the card out smoothly, then refresh the list once. Refreshing
 // immediately made the card vanish abruptly and the grid jump (the "glitch").
 function handleDeleted(){
  setDeleted(true);
  timer.current=window.setTimeout(()=>router.refresh(),340);
 }
 return <article aria-hidden={deleted||undefined} className={`editorial-shadow group relative overflow-hidden border bg-zinc-950 transition-all duration-300 hover:-translate-y-1 hover:border-purple ${featured?"border-purple/70":"border-zinc-800"} ${deleted?"pointer-events-none translate-y-2 scale-[.97] opacity-0":""}`}>
  {typeof index==="number"&&<div className="absolute right-3 top-1 font-display text-6xl font-black text-white/[.04]">{String(index).padStart(2,"0")}</div>}
  <div className="p-5 sm:p-6">
   <div className="mb-5 flex items-center gap-2"><Avatar name={idea.author_name} url={idea.avatar_url} size="sm"/><div><Link href={`/profile/${idea.author_username}`} className="block text-[11px] font-bold hover:text-lime">{idea.author_name}</Link><span className="font-mono text-[8px] uppercase text-zinc-600">{timeAgo(idea.created_at)}</span></div><div className="ml-auto"><IdeaOwnerControls idea={idea} canManage={Boolean(idea.can_manage)} onDeleted={handleDeleted}/></div></div>
   <Link href={`/ideas/${idea.id}`}><h3 className="font-display text-xl font-black leading-tight tracking-tight transition group-hover:text-lavender sm:text-2xl">{idea.title}</h3></Link>
   <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-zinc-500">{idea.short_description}</p>
  </div>
  <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 px-3 py-2.5"><div className="flex items-center gap-1 border-r border-zinc-800 pr-3 font-mono text-xs font-bold text-lime"><ArrowBigUp size={16}/>{idea.vote_score||0}</div><LikeButton ideaId={idea.id} initialCount={idea.like_count||0} initialLiked={Boolean(idea.viewer_liked)}/><IdeaComments ideaId={idea.id} initialCount={idea.comment_count||0} viewerId={idea.viewer_id||null} ideaTitle={idea.title}/><Link aria-label={`View ${idea.title} and comments`} href={`/ideas/${idea.id}`} className="ml-auto border border-zinc-800 p-2 text-zinc-500 transition hover:border-purple hover:text-white"><MoveUpRight size={14}/></Link></div>
 </article>;
}
