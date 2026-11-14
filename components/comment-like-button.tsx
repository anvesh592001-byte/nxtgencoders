"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Fast comment like: same pattern as the idea LikeButton — direct RPC with an
// optimistic update (no server-action round trip, no page revalidation), so the
// heart and count react instantly and roll back if the save fails.
export function CommentLikeButton({
  commentId,
  initialCount,
  initialLiked,
  rpc,
}: {
  commentId: string;
  initialCount: number;
  initialLiked: boolean;
  rpc: "cast_comment_vote" | "toggle_problem_comment_like";
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  // Stay in sync when a server re-render delivers fresh values (e.g. after
  // posting a reply or a realtime refresh), mirroring LikeButton.
  const [prevInitialLiked, setPrevInitialLiked] = useState(initialLiked);
  const [prevInitialCount, setPrevInitialCount] = useState(initialCount);
  if (!pending && (initialLiked !== prevInitialLiked || initialCount !== prevInitialCount)) {
    setPrevInitialLiked(initialLiked);
    setPrevInitialCount(initialCount);
    setLiked(initialLiked);
    setCount(initialCount);
  }

  async function toggle() {
    if (pending) return;
    const previousLiked = liked;
    const previousCount = count;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((value) => Math.max(0, value + (nextLiked ? 1 : -1)));
    setPending(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase.rpc(rpc, { p_comment_id: commentId });
      if (error) throw error;
    } catch {
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Unlike comment" : "Like comment"}
        className={`p-2 transition hover:scale-110 disabled:cursor-wait ${liked ? "text-red-500" : "text-zinc-600 hover:text-red-500"}`}
      >
        <span key={liked ? "liked" : "unliked"} className="animate-heart-pop inline-flex">
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </span>
      </button>
      {count > 0 && (
        <span key={count} className="animate-count-tick font-mono text-[10px] font-bold text-zinc-500">
          {count}
        </span>
      )}
    </span>
  );
}
