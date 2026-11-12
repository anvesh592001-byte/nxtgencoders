import { notFound } from "next/navigation";
import { ArrowBigDown, ArrowBigUp, Bookmark, Calendar, Flag, GitFork, MessageSquare } from "lucide-react";
import { getIdea } from "@/lib/data";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addComment, castIdeaVote, reportContent, toggleBookmark } from "@/app/actions";
import { CommentThread } from "@/components/comment-thread";
import { formatDate } from "@/lib/utils";
import { ErrorNote } from "@/components/error-note";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function IdeaDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
 const {id}=await params;
 const sp=await searchParams;
 const idea:any=await getIdea(id);
 if(!idea)notFound();
 return <>
  <RealtimeRefresh table="idea_comments" filter={`idea_id=eq.${id}`}/>
  <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
   <ErrorNote message={sp.error}/>
   <div className="grid gap-6 lg:grid-cols-[68px_minmax(0,1fr)_250px]">
    <aside className="flex gap-2 lg:flex-col">
     <form action={castIdeaVote}><input type="hidden" name="idea_id" value={id}/><input type="hidden" name="value" value={idea.viewerVote===1?0:1}/><button aria-label="Upvote" className={`flex h-14 w-16 flex-col items-center justify-center border font-mono text-[10px] font-bold transition hover:border-lime hover:text-lime ${idea.viewerVote===1?"border-lime bg-lime/10 text-lime":"border-zinc-800 text-zinc-500"}`}><ArrowBigUp size={20}/>{idea.vote_score||0}</button></form>
     <form action={castIdeaVote}><input type="hidden" name="idea_id" value={id}/><input type="hidden" name="value" value={idea.viewerVote===-1?0:-1}/><button aria-label="Downvote" className={`flex h-14 w-12 items-center justify-center border transition hover:text-red-400 lg:h-10 lg:w-16 ${idea.viewerVote===-1?"border-red-400 text-red-400":"border-zinc-800 text-zinc-600"}`}><ArrowBigDown size={20}/></button></form>
     <form action={toggleBookmark}><input type="hidden" name="idea_id" value={id}/><button aria-label="Bookmark" className={`flex h-14 w-12 items-center justify-center border lg:h-10 lg:w-16 ${idea.bookmarked?"border-purple text-lavender":"border-zinc-800 text-zinc-600"}`}><Bookmark size={17} fill={idea.bookmarked?"currentColor":"none"}/></button></form>
    </aside>
    <main className="min-w-0">
     <article className="border border-zinc-800 bg-zinc-950 p-6 sm:p-9">
      <h1 className="font-display text-4xl font-black leading-[.95] tracking-[-.045em] sm:text-6xl">{idea.title}</h1>
      <div className="mt-6 flex flex-wrap items-center gap-5 border-y border-zinc-800 py-4"><div className="flex items-center gap-3"><Avatar name={idea.author_name} url={idea.avatar_url}/><div><a href={`/profile/${idea.author_username}`} className="text-xs font-bold hover:text-lime">{idea.author_name}</a><p className="font-mono text-[8px] uppercase text-zinc-600">@{idea.author_username}</p></div></div><span className="flex items-center gap-1 font-mono text-[9px] uppercase text-zinc-600"><Calendar size={13}/>{formatDate(idea.created_at)}</span><span className="flex items-center gap-1 font-mono text-[9px] uppercase text-zinc-600"><MessageSquare size={13}/>{idea.comment_count||0} comments</span></div>
      <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-zinc-300">{idea.detailed_explanation}</p>
     </article>
     <section id="comments" className="mt-8">
      <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Talk about this idea</p><h2 className="mt-2 font-display text-3xl font-black uppercase">Comments</h2></div><span className="font-display text-3xl font-black text-zinc-700">{idea.comment_count||0}</span></div>
      <form action={addComment} className="mb-5 border border-purple/50 bg-deep p-4 sm:p-5"><input type="hidden" name="idea_id" value={id}/><label><span className="label">Add a comment</span><textarea name="body" required minLength={2} maxLength={5000} rows={4} className="field" placeholder="Write your comment..."/></label><Button type="submit" size="sm" className="mt-3">Post comment</Button></form>
      {idea.comments?.length?<CommentThread comments={idea.comments} ideaId={id} viewerId={idea.viewerId}/>:<div className="border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">No comments yet. Start the conversation.</div>}
     </section>
    </main>
    <aside className="space-y-4">
     <div className="border border-zinc-800 bg-zinc-950 p-5"><p className="eyebrow">At a glance</p><dl className="mt-5 space-y-4">{[["Votes",idea.vote_score||0],["Comments",idea.comment_count||0]].map(([k,v])=><div key={String(k)} className="flex items-end justify-between border-b border-zinc-800 pb-2"><dt className="font-mono text-[9px] uppercase text-zinc-600">{k}</dt><dd className="font-display text-2xl font-black">{v}</dd></div>)}</dl></div>
     <Button href={`/ideas/new?remix=${id}`} variant="purple" className="w-full"><GitFork size={15}/>Build on this idea</Button>
     <form action={reportContent}><input type="hidden" name="content_type" value="idea"/><input type="hidden" name="content_id" value={id}/><Button type="submit" variant="ghost" className="w-full"><Flag size={14}/>Report</Button></form>
    </aside>
   </div>
  </div>
 </>;
}
