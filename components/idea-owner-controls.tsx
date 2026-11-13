"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [menuClosing, setMenuClosing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteClosing, setDeleteClosing] = useState(false);
  const menuTimer = useRef<number | null>(null);
  const editTimer = useRef<number | null>(null);
  const deleteTimer = useRef<number | null>(null);

  function closeMenu() {
    setMenuClosing(true);
    menuTimer.current = window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 140);
  }
  function closeEdit() {
    setEditClosing(true);
    editTimer.current = window.setTimeout(() => {
      setEditing(false);
      setEditClosing(false);
    }, 200);
  }
  function closeDelete() {
    setDeleteClosing(true);
    deleteTimer.current = window.setTimeout(() => {
      setConfirmingDelete(false);
      setDeleteClosing(false);
    }, 200);
  }

  useEffect(
    () => () => {
      if (menuTimer.current) window.clearTimeout(menuTimer.current);
      if (editTimer.current) window.clearTimeout(editTimer.current);
      if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
    },
    []
  );
  const [title, setTitle] = useState(idea.title);
  const [body, setBody] = useState(idea.detailed_explanation || idea.short_description || "");
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
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
        closeEdit();
        closeDelete();
        closeMenu();
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
      closeEdit();
      closeMenu();
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
      closeDelete();
      closeMenu();
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
        {menuOpen && (
          <div
            role="menu"
            className={`absolute right-0 z-40 mt-2 w-44 border border-zinc-700 bg-zinc-950 p-1 shadow-2xl ${
              menuClosing ? "animate-fade-out" : "animate-dialog-in"
            }`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
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
                closeMenu();
                setError(null);
                setConfirmingDelete(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-red-300 hover:bg-red-400/10"
            >
              <Trash2 size={13} /> Delete Post
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 ${
            editClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={() => !pending && closeEdit()}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`comic-panel w-full max-w-xl bg-zinc-950 p-5 sm:p-6 ${
              editClosing ? "animate-fade-out" : "animate-dialog-in"
            }`}
          >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Edit post</p>
                  <h2 className="mt-2 font-display text-2xl font-black uppercase">Update your idea</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEdit}
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
                  onClick={closeEdit}
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
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 ${
            deleteClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={() => !pending && !deleting && closeDelete()}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`comic-panel w-full max-w-md bg-zinc-950 p-6 ${
              deleteClosing ? "animate-fade-out" : "animate-dialog-in"
            }`}
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
                  onClick={closeDelete}
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
          </div>
        </div>
      )}
    </>
  );
}
