"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { deleteIdea, updateIdea } from "@/app/actions";
import { showToast } from "@/components/toast-host";
import { markManualRefresh } from "@/components/realtime-refresh";

type IdeaForControls = {
  id: string;
  title: string;
  detailed_explanation?: string | null;
  short_description?: string | null;
  author_id: string;
};

export function IdeaOwnerControls({
  idea,
  canManage,
  redirectAfterDelete = false,
  onDeleted,
}: {
  idea: IdeaForControls;
  canManage: boolean;
  redirectAfterDelete?: boolean;
  /** Called after a successful delete so the parent card can animate out
   *  before the list refreshes (prevents an abrupt jump/flicker). */
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [body, setBody] = useState(idea.detailed_explanation || idea.short_description || "");
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  // Keep the editor fields in sync when the idea changes (e.g. after an
  // edit + refresh), without clobbering text while the editor is open.
  // Render-time adjustment is React's recommended pattern for prop sync.
  const [prevIdeaTitle, setPrevIdeaTitle] = useState(idea.title);
  const [prevIdeaBody, setPrevIdeaBody] = useState(idea.detailed_explanation || idea.short_description || "");
  const nextIdeaBody = idea.detailed_explanation || idea.short_description || "";
  if (!editing && (idea.title !== prevIdeaTitle || nextIdeaBody !== prevIdeaBody)) {
    setPrevIdeaTitle(idea.title);
    setPrevIdeaBody(nextIdeaBody);
    setTitle(idea.title);
    setBody(nextIdeaBody);
  }

  // Lock background scroll and allow Escape while a dialog is open.
  useEffect(() => {
    if (!editing && !confirmingDelete) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending && !deleting) {
        setEditing(false);
        setConfirmingDelete(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [editing, confirmingDelete, pending, deleting]);

  if (!canManage) return null;

  async function saveEdit() {
    if (pending) return;
    setError(null);
    if (title.trim().length < 3) {
      setError("Heading must be at least 3 characters.");
      return;
    }
    if (body.trim().length < 10) {
      setError("Idea must be at least 10 characters.");
      return;
    }
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("idea_id", idea.id);
      formData.set("title", title.trim());
      formData.set("idea", body.trim());
      const result = await updateIdea(formData);
      if (!result.ok) throw new Error(result.error || "Update failed. Please try again.");
      setEditing(false);
      setMenuOpen(false);
      showToast("Updated successfully");
      markManualRefresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (pending || deleting) return;
    setError(null);
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.set("idea_id", idea.id);
      const result = await deleteIdea(formData);
      if (!result.ok) throw new Error(result.error || "Delete failed. Please try again.");
      setConfirmingDelete(false);
      setMenuOpen(false);
      showToast("Post deleted successfully");
      markManualRefresh();
      if (redirectAfterDelete) {
        // Detail page: navigate straight away. A refresh here would re-render
        // the deleted page and flash a 404 before the navigation lands.
        router.push("/explore");
      } else if (onDeleted) {
        // Feed card: let the card animate out, then refresh once.
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Post options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="border border-zinc-800 p-2 text-zinc-500 transition hover:border-purple hover:text-white"
        >
          <MoreHorizontal size={16} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute right-0 z-40 mt-2 w-44 border border-zinc-700 bg-zinc-950 p-1 shadow-2xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setError(null);
                  setEditing(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                <Pencil size={13} /> Edit Post
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setError(null);
                  setConfirmingDelete(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-red-300 hover:bg-red-400/10"
              >
                <Trash2 size={13} /> Delete Post
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
            onClick={() => !pending && setEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              onClick={(event) => event.stopPropagation()}
              className="comic-panel w-full max-w-xl bg-zinc-950 p-5 sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Edit post</p>
                  <h2 className="mt-2 font-display text-2xl font-black uppercase">Update your idea</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                  aria-label="Close editor"
                  className="p-2 text-zinc-500 hover:text-white disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <label className="block">
                <span className="label">Heading</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  minLength={3}
                  maxLength={120}
                  className="field"
                  disabled={pending}
                />
              </label>
              <label className="mt-4 block">
                <span className="label">Your idea</span>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  minLength={10}
                  maxLength={10000}
                  rows={10}
                  className="field resize-y"
                  disabled={pending}
                />
              </label>
              {error && (
                <p role="alert" className="mt-4 border border-red-400/50 bg-red-400/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                  className="border border-zinc-700 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:border-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={pending}
                  className="inline-flex items-center gap-2 bg-lime px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink disabled:cursor-wait disabled:opacity-70"
                >
                  {pending ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
            onClick={() => !pending && !deleting && setConfirmingDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 8 }}
              onClick={(event) => event.stopPropagation()}
              className="comic-panel w-full max-w-md bg-zinc-950 p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-red-400/60 bg-red-400/10 text-red-300">
                  <Trash2 size={18} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-black uppercase">Delete post?</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Are you sure you want to delete this post?
                  </p>
                </div>
              </div>
              {error && (
                <p role="alert" className="mt-4 border border-red-400/50 bg-red-400/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={pending || deleting}
                  className="border border-zinc-700 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:border-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={pending || deleting}
                  className="inline-flex items-center gap-2 bg-red-500 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white disabled:cursor-wait disabled:opacity-70"
                >
                  {deleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
