import Link from "next/link";
import { addProblemComment, deleteProblemComment, reportContent } from "@/app/actions";
import { CommentLikeButton } from "./comment-like-button";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { timeAgo } from "@/lib/utils";
import { Flag, Trash2 } from "lucide-react";

export function ProblemComments({problemId,comments,viewerId}:{problemId:string;comments:any[];viewerId?:string|null}){
 return <section id="comments" className="mt-8">
  <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Join the conversation</p><h2 className="mt-2 font-display text-3xl font-black uppercase">Comments</h2></div><span className="font-display text-3xl font-black text-zinc-700">{comments.length}</span></div>
  <form action={addProblemComment} className="mb-5 flex items-start gap-3 border border-purple/50 bg-deep p-4"><input type="hidden" name="problem_id" value={problemId}/><div className="min-w-0 flex-1"><label className="label" htmlFor="problem-comment">Add a comment</label><textarea id="problem-comment" name="body" required minLength={2} maxLength={3000} rows={3} className="field" placeholder="What do you think about this problem?"/></div><Button type="submit" size="sm" className="mt-6">Post</Button></form>
  {comments.length?<div className="divide-y divide-zinc-800 border-y border-zinc-800">{comments.map(c=>{const likes=(c.likes||[]).length;const liked=(c.likes||[]).some((x:any)=>x.user_id===viewerId);return <article key={c.id} className="flex items-start gap-3 py-4"><Avatar name={c.author?.display_name} url={c.author?.avatar_url} size="sm"/><div className="min-w-0 flex-1"><p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300"><Link href={`/profile/${c.author?.username}`} className="mr-2 font-bold text-white hover:text-purple">{c.author?.username}</Link>{c.body}</p><div className="mt-2 flex items-center gap-3 font-mono text-[8px] font-bold uppercase text-zinc-600"><span>{timeAgo(c.created_at)}</span><form action={reportContent}><input type="hidden" name="content_type" value="problem_comment"/><input type="hidden" name="content_id" value={c.id}/><button className="hover:text-red-400"><Flag className="mr-1 inline" size={10}/>Report</button></form>{viewerId===c.author_id&&<form action={deleteProblemComment}><input type="hidden" name="comment_id" value={c.id}/><input type="hidden" name="problem_id" value={problemId}/><button className="hover:text-red-400"><Trash2 className="mr-1 inline" size={10}/>Delete</button></form>}</div></div><CommentLikeButton commentId={c.id} initialCount={likes} initialLiked={liked} rpc="toggle_problem_comment_like"/></article>})}</div>:<div className="border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">No comments yet. Be the first to respond.</div>}
 </section>;
}
