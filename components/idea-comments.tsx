"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Heart,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./ui/avatar";
import { timeAgo } from "@/lib/utils";
import { showToast } from "./toast-host";

type CommentRow = {
  id: string;
  idea_id: string;
  author_id: string;
  body: string;
  parent_id: string | null;
  created_at: string;
  edited_at: string | null;
  author?: { display_name?: string; username?: string; avatar_url?: string } | null;
  votes?: { user_id: string; value: number }[];
};

const COMMENT_SELECT =
  "*,author:profiles!idea_comments_author_id_fkey(display_name,username,avatar_url),votes:comment_votes(user_id,value)";

function likeCount(c: CommentRow) {
  return (c.votes || []).reduce((n, v) => n + (v.value || 0), 0);
}
function isLiked(c: CommentRow, viewerId: string | null) {
  return Boolean(viewerId && (c.votes || []).some((v) => v.user_id === viewerId));
}

export function IdeaComments({
  ideaId,
  initialCount,
  viewerId,
  ideaTitle,
}: {
  ideaId: string;
  initialCount: number;
  viewerId: string | null;
  ideaTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  // True only on the client, so the mobile bottom sheet can portal to document.body.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetTimer = useRef<number | null>(null);

  // Keep the live count in sync with server values delivered by realtime refresh.
  const [prevInitialCount, setPrevInitialCount] = useState(initialCount);
  if (initialCount !== prevInitialCount) {
    setPrevInitialCount(initialCount);
    setCount(initialCount);
  }

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(
    () => () => {
      if (sheetTimer.current) window.clearTimeout(sheetTimer.current);
    },
    []
  );

  const fetchComments = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from("idea_comments")
      .select(COMMENT_SELECT)
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true });
    setLoading(false);
    if (!err && data) {
      setComments(data as CommentRow[]);
      setLoaded(true);
    }
  }, [ideaId]);

  function toggleOpen() {
    const next = !open;
    if (sheetTimer.current) window.clearTimeout(sheetTimer.current);
    setSheetClosing(false);
    setOpen(next);
    if (next && !loaded) void fetchComments();
  }

  function close() {
    // Play the sheet exit animation, then unmount.
    setSheetClosing(true);
    sheetTimer.current = window.setTimeout(() => {
      setOpen(false);
      setSheetClosing(false);
    }, 260);
    setReplyTo(null);
    setEditingId(null);
    setError(null);
  }

  async function postComment(parentId: string | null, text: string) {
    const clean = text.trim();
    if (clean.length < 2 || clean.length > 5000 || posting) return;
    if (!viewerId) {
      setError("Sign in to join the discussion.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setPosting(true);
    setError(null);
    // Optimistic entry so the comment appears instantly.
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: CommentRow = {
      id: tempId,
      idea_id: ideaId,
      author_id: viewerId,
      body: clean,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      edited_at: null,
      author: { display_name: "You", username: "you", avatar_url: undefined },
      votes: [],
    };
    setComments((prev) => [...prev, optimistic]);
    setCount((n) => n + 1);
    try {
      const { data, error: err } = await supabase
        .from("idea_comments")
        .insert({
          idea_id: ideaId,
          author_id: viewerId,
          body: clean,
          parent_id: parentId,
          client_request_id: crypto.randomUUID(),
        })
        .select(COMMENT_SELECT)
        .single();
      if (err) throw err;
      setComments((prev) => prev.map((c) => (c.id === tempId ? (data as CommentRow) : c)));
      showToast(parentId ? "Reply posted" : "Comment posted");
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setCount((n) => Math.max(0, n - 1));
      setError(err instanceof Error ? err.message : "Comment could not be posted. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(comment: CommentRow) {
    if (!viewerId) {
      setError("Sign in to like comments.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const wasLiked = isLiked(comment, viewerId);
    const prevVotes = comment.votes || [];
    // Optimistic toggle.
    const nextVotes = wasLiked
      ? prevVotes.filter((v) => v.user_id !== viewerId)
      : [...prevVotes, { user_id: viewerId, value: 1 }];
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, votes: nextVotes } : c)));
    const { error: err } = await supabase.rpc("cast_comment_vote", { p_comment_id: comment.id });
    if (err) {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, votes: prevVotes } : c)));
      setError("Like could not be saved. Please try again.");
    }
  }

  async function saveEdit(comment: CommentRow) {
    const clean = editBody.trim();
    if (clean.length < 2 || clean.length > 5000) {
      setError("Comment must be between 2 and 5,000 characters.");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const prevBody = comment.body;
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, body: clean } : c)));
    setEditingId(null);
    const { error: err } = await supabase
      .from("idea_comments")
      .update({ body: clean, edited_at: new Date().toISOString() })
      .eq("id", comment.id);
    if (err) {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, body: prevBody } : c)));
      setError("Comment could not be updated. Please try again.");
    } else {
      showToast("Comment updated");
    }
  }

  async function removeComment(comment: CommentRow) {
    const supabase = createClient();
    if (!supabase) return;
    const snapshot = comments;
    const removed = comments.filter((c) => c.id === comment.id || c.parent_id === comment.id).length;
    setComments((prev) => prev.filter((c) => c.id !== comment.id && c.parent_id !== comment.id));
    setCount((n) => Math.max(0, n - removed));
    const { error: err } = await supabase.from("idea_comments").delete().eq("id", comment.id);
    if (err) {
      setComments(snapshot);
      setCount((n) => n + removed);
      setError("Comment could not be deleted. Please try again.");
    } else {
      showToast("Comment deleted");
    }
  }

  function renderComment(c: CommentRow, depth: number) {
    const likes = likeCount(c);
    const liked = isLiked(c, viewerId);
    const mine = Boolean(viewerId && c.author_id === viewerId);
    const isEditing = editingId === c.id;
    const isReplying = replyTo === c.id;
    const children = comments.filter((x) => x.parent_id === c.id);
    return (
      <div key={c.id} className={depth ? "ml-9 border-l border-zinc-800 pl-3" : ""}>
        <div className="flex items-start gap-2.5 py-3">
          <Avatar name={c.author?.display_name} url={c.author?.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-5 text-zinc-200">
              <Link
                href={`/profile/${c.author?.username || ""}`}
                className="mr-1.5 font-bold text-white hover:text-purple"
              >
                {c.author?.username || c.author?.display_name || "Student"}
              </Link>
              {isEditing ? (
                <span className="mt-1 flex gap-2">
                  <input
                    className="field flex-1 !py-1.5 text-[13px]"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    maxLength={5000}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => void saveEdit(c)}
                    className="shrink-0 bg-lime px-3 font-mono text-[10px] font-bold uppercase text-ink"
                  >
                    Save
                  </button>
                </span>
              ) : (
                <span className="whitespace-pre-wrap break-words">{c.body}</span>
              )}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] font-bold uppercase text-zinc-600">
              <span>{timeAgo(c.created_at)}</span>
              {c.edited_at && <span>edited</span>}
              {likes > 0 && (
                <span className={liked ? "text-red-400" : ""}>
                  {likes} {likes === 1 ? "like" : "likes"}
                </span>
              )}
              {!isEditing && viewerId && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(isReplying ? null : c.id);
                    setReplyBody("");
                  }}
                  className="hover:text-purple"
                >
                  Reply
                </button>
              )}
              {mine && !isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c.id);
                      setEditBody(c.body);
                    }}
                    className="inline-flex items-center gap-1 hover:text-purple"
                  >
                    <Pencil size={10} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeComment(c)}
                    className="inline-flex items-center gap-1 hover:text-red-400"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </>
              )}
            </div>
            {isReplying && (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void postComment(c.id, replyBody).then(() => {
                    setReplyBody("");
                    setReplyTo(null);
                  });
                }}
              >
                <input
                  className="field flex-1 !py-1.5 text-[13px]"
                  placeholder={`Reply to @${c.author?.username || "student"}...`}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  maxLength={5000}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={posting || replyBody.trim().length < 2}
                  className="shrink-0 bg-lime px-3 font-mono text-[10px] font-bold uppercase text-ink disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            )}
          </div>
          <button
            type="button"
            onClick={() => void toggleLike(c)}
            aria-label={liked ? "Unlike comment" : "Like comment"}
            aria-pressed={liked}
            className={`shrink-0 p-1.5 transition hover:scale-110 ${
              liked ? "text-red-500" : "text-zinc-600 hover:text-red-500"
            }`}
          >
            <span key={liked ? "liked" : "unliked"} className="animate-heart-pop inline-flex">
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
            </span>
          </button>
        </div>
        {children.map((child) => renderComment(child, depth + 1))}
      </div>
    );
  }

  const topLevel = comments.filter((c) => !c.parent_id);

  const panel = (
    <div className="flex max-h-[inherit] flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-zinc-400">
          Comments · {count}
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Close comments"
          className="p-1 text-zinc-500 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4">
        {loading ? (
          <p className="flex items-center gap-2 py-8 text-xs text-zinc-500">
            <LoaderCircle size={14} className="animate-spin" /> Loading comments...
          </p>
        ) : topLevel.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-500">
            No comments yet. Start the discussion.
          </p>
        ) : (
          topLevel.map((c) => renderComment(c, 0))
        )}
      </div>
      {error && (
        <p role="alert" className="border-t border-zinc-800 px-4 py-2 text-[11px] text-red-300">
          {error}
        </p>
      )}
      <div className="border-t border-zinc-800 p-3">
        {viewerId ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void postComment(null, body).then(() => setBody(""));
            }}
          >
            <input
              ref={inputRef}
              className="field flex-1 !py-2 text-[13px]"
              placeholder="Add a comment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
            />
            <button
              type="submit"
              disabled={posting || body.trim().length < 2}
              className="inline-flex shrink-0 items-center gap-1.5 bg-lime px-3.5 py-2 font-mono text-[10px] font-bold uppercase text-ink disabled:opacity-50"
            >
              {posting ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}
              Post
            </button>
          </form>
        ) : (
          <p className="py-1 text-center text-xs text-zinc-500">
            <Link href="/login" className="font-bold text-lime hover:underline">
              Sign in
            </Link>{" "}
            to join the discussion.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-label={`${open ? "Hide" : "Show"} comments for ${ideaTitle}`}
        className={`flex items-center gap-1 px-2 font-mono text-[10px] transition ${
          open ? "text-purple" : "text-zinc-500 hover:text-white"
        }`}
      >
        <MessageSquare size={14} />
        {count} {count === 1 ? "comment" : "comments"}
      </button>

      {/* Desktop: inline expandable panel (grid-rows height animation) */}
      <div
        className={`order-last hidden basis-full grid transition-all duration-200 ease-out sm:block ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden border-t border-zinc-800">
          <div className="max-h-96">{panel}</div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[90] sm:hidden">
            <div
              onClick={close}
              className={`absolute inset-0 bg-black/70 ${sheetClosing ? "animate-fade-out" : "animate-fade-in"}`}
            />
            <div
              className={`absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col border-t border-zinc-700 bg-zinc-950 ${
                sheetClosing ? "animate-sheet-down" : "animate-sheet-up"
              }`}
            >
              <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-700" />
              {panel}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
