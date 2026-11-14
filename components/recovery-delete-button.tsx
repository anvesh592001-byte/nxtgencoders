"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";
import { deleteRecoveryRequest } from "@/app/actions";

export function RecoveryDeleteButton({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  function close() {
    setClosing(true);
    timer.current = window.setTimeout(() => { setOpen(false); setClosing(false); setError(null); }, 180);
  }
  function openDialog() {
    if (timer.current) window.clearTimeout(timer.current);
    setClosing(false);
    setError(null);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  async function confirmDelete() {
    if (deleting) return;
    setError(null);
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.set("request_id", requestId);
      await deleteRecoveryRequest(formData);
      // Server action revalidates /admin, so the request disappears on refresh.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Delete recovery request"
        className="inline-flex items-center gap-1.5 border border-zinc-800 px-3 py-2 font-mono text-[9px] font-bold uppercase text-zinc-500 transition hover:border-red-400/60 hover:text-red-300"
      >
        <Trash2 size={13} /> Delete
      </button>
      {open && (
        <div
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Delete recovery request"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`comic-panel w-full max-w-sm bg-zinc-950 p-6 ${closing ? "animate-fade-out" : "animate-dialog-in"}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-display text-lg font-black uppercase">Delete this request?</h2>
              <button type="button" onClick={close} aria-label="Cancel"><X size={18} /></button>
            </div>
            <p className="text-sm leading-6 text-zinc-400">
              This will permanently remove the account recovery request. The student will need to submit a new request if they still need help.
            </p>
            {error && <p role="alert" className="mt-4 border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={close}
                disabled={deleting}
                className="flex-1 border border-zinc-700 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-zinc-400 transition hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 bg-red-500 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-white transition hover:bg-red-400 disabled:opacity-60"
              >
                {deleting ? <><LoaderCircle size={14} className="animate-spin" /> Deleting…</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
