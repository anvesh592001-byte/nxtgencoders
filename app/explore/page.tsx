import { Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "@/components/idea-card";
import { EmptyState } from "@/components/empty-state";
import { getIdeas } from "@/lib/data";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export const metadata={title:"Explore Ideas"};

export default async function Explore({searchParams}:{searchParams:Promise<{q?:string;sort?:string}>}){
 const p=await searchParams;
 const ideas=await getIdeas({...p,limit:48});
 return <>
  <RealtimeRefresh tables={[{table:"ideas"},{table:"idea_likes"},{table:"idea_comments"}]}/>
  <PageHeader eyebrow="Ideas from the community" title="See what people are thinking." description="Read an idea, vote for it, or leave a comment." aside={<Button href="/ideas/new" className="hidden sm:flex">Post an idea</Button>}/>
  <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
   <form className="mb-8 grid gap-3 border border-zinc-800 bg-zinc-950 p-3 md:grid-cols-[1fr_180px_auto]"><label className="flex items-center gap-2 border border-zinc-700 bg-ink px-3"><Search size={15} className="text-zinc-600"/><input name="q" defaultValue={p.q} placeholder="Search ideas..." className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-zinc-700"/></label><select name="sort" defaultValue={p.sort||"trending"} className="field h-11 py-0"><option value="trending">Trending</option><option value="newest">Newest</option><option value="discussed">Most commented</option></select><Button type="submit" variant="purple">Search</Button></form>
   <p className="mb-5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500"><span className="text-lime">{ideas.length}</span> ideas</p>
   {ideas.length?<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{ideas.map((idea,i)=><IdeaCard key={idea.id} idea={idea} index={i+1}/>)}</div>:<EmptyState title="No ideas found" body="Try another search or post the idea yourself." href="/ideas/new" action="Post an idea"/>}
  </div>
 </>;
}
