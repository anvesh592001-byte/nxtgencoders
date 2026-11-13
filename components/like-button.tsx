"use client";

import { useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LikeButton({
  ideaId,
  initialCount,
  initialLiked,
  className = "",
}: {
  ideaId: string;
  initialCount: number;
  initialLiked: boolean;
  className?: string;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stay in sync when a realtime refresh delivers fresh server values
  // (otherwise counts/like state go stale after other users act).
  // Render-time adjustment is React's recommended pattern for prop sync.
  const [prevInitialLiked, setPrevInitialLiked] = useState(initialLiked);
  const [prevInitialCount, setPrevInitialCount] = useState(initialCount);
  if (!pending && (initialLiked !== prevInitialLiked || initialCount !== prevInitialCount)) {
    setPrevInitialLiked(initialLiked);
    setPrevInitialCount(initialCount);
    setLiked(initialLiked);
    setCount(initialCount);
  }

  async function toggleLike() {
    if (pending) return;
    const previousLiked = liked;
    const previousCount = count;
    const nextLiked = !liked;
    setError(null);
    setLiked(nextLiked);
    setCount((value) => Math.max(0, value + (nextLiked ? 1 : -1)));
    setPending(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error: rpcError } = await supabase.rpc("toggle_idea_like", {
        p_idea_id: ideaId,
      });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("Like could not be saved. Please try again.");
      setLiked(Boolean(row.liked));
      setCount(Number(row.like_count || 0));
    } catch (err) {
      setLiked(previousLiked);
      setCount(previousCount);
      setError(
        err instanceof Error
          ? err.message.replace(/^.*?:\s*/, "")
          : "Like could not be saved. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleLike}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this idea" : "Like this idea"}
        title={liked ? "Unlike" : "Like"}
        className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10px] font-bold transition disabled:cursor-wait disabled:opacity-70 ${
          liked
            ? "border-red-400/70 bg-red-400/10 text-red-300"
            : "border-zinc-800 text-zinc-500 hover:border-red-400/60 hover:text-red-300"
        }`}
      >
        <span key={liked ? "liked" : "unliked"} className="animate-heart-pop inline-flex">
          {pending ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
          )}
        </span>
        <span key={count} className="animate-count-tick inline-block">
          {count}
        </span>
        <span className="hidden sm:inline">{liked ? "Liked" : "Like"}</span>
      </button>
      {error && (
        <span role="alert" className="max-w-40 text-[10px] leading-4 text-red-300">
          {error}
        </span>
      )}
    </span>
  );
}
