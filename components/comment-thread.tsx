import Link from "next/link";
import { addComment, deleteComment, editComment, reportContent } from "@/app/actions";
import { CommentLikeButton } from "./comment-like-button";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { timeAgo } from "@/lib/utils";
import { Flag, MessageCircle, Trash2 } from "lucide-react";
import { ClientRequestId } from "./client-request-id";

export function CommentThread({comments,ideaId,viewerId,parent=null,depth=0}:{comments:any[];ideaId:string;viewerId?:string|null;parent?:string|null;depth?:number}){
 const list=comments.filter(c=>(c.parent_id||null)===parent);
 if(!list.length)return null;
 return <div className={depth?"ml-8 border-l border-zinc-800 pl-3":"divide-y divide-zinc-800 border-y border-zinc-800"}>
  {list.map(c=>{
   const likes=(c.votes||[]).length;
   const liked=(c.votes||[]).some((v:any)=>v.user_id===viewerId);
   return <div key={c.id} className="py-4">
    <div className="flex items-start gap-3">
     <Avatar name={c.author?.display_name} url={c.author?.avatar_url} size="sm"/>
     <div className="min-w-0 flex-1">
      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300"><Link href={`/profile/${c.author?.username}`} className="mr-2 font-bold text-white hover:text-purple">{c.author?.username}</Link>{c.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[8px] font-bold uppercase text-zinc-600">
       <span>{timeAgo(c.created_at)}</span>
       <details><summary className="cursor-pointer list-none hover:text-purple"><MessageCircle className="mr-1 inline" size={11}/>Reply</summary><form action={addComment} className="mt-3 flex max-w-lg gap-2"><input type="hidden" name="idea_id" value={ideaId}/><input type="hidden" name="parent_id" value={c.id}/><ClientRequestId/><input name="body" required minLength={2} maxLength={5000} className="field" placeholder={`Reply to @${c.author?.username}`}/><Button type="submit" size="sm">Post</Button></form></details>
       <form action={reportContent}><input type="hidden" name="content_type" value="idea_comment"/><input type="hidden" name="content_id" value={c.id}/><button className="hover:text-red-400"><Flag className="mr-1 inline" size={10}/>Report</button></form>
       {viewerId===c.author_id&&<><details><summary className="cursor-pointer list-none hover:text-purple">Edit</summary><form action={editComment} className="mt-3 flex max-w-lg gap-2"><input type="hidden" name="comment_id" value={c.id}/><input type="hidden" name="idea_id" value={ideaId}/><input name="body" defaultValue={c.body} className="field"/><Button size="sm">Save</Button></form></details><form action={deleteComment}><input type="hidden" name="comment_id" value={c.id}/><input type="hidden" name="idea_id" value={ideaId}/><button aria-label="Delete your comment" className="hover:text-red-400"><Trash2 className="mr-1 inline" size={10}/>Delete</button></form></>}
      </div>
     </div>
     <CommentLikeButton commentId={c.id} initialCount={likes} initialLiked={liked} rpc="cast_comment_vote"/>
    </div>
    <CommentThread comments={comments} ideaId={ideaId} viewerId={viewerId} parent={c.id} depth={depth+1}/>
   </div>
  })}
 </div>;
}
