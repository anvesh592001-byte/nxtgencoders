"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { removeAvatar } from "@/app/actions";

export function RemoveAvatarButton() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const timer = useRef<number | null>(null);

  function close() {
    setClosing(true);
    timer.current = window.setTimeout(() => { setOpen(false); setClosing(false); }, 180);
  }
  function openDialog() {
    if (timer.current) window.clearTimeout(timer.current);
    setClosing(false);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="flex w-full items-center justify-center gap-2 border border-zinc-800 px-3 py-2 font-mono text-[9px] font-bold uppercase text-zinc-500 transition hover:border-red-400/60 hover:text-red-300"
      >
        <Trash2 size={13} /> Remove profile picture
      </button>
      {open && (
        <div
          className={`fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Remove profile picture"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`comic-panel w-full max-w-sm bg-zinc-950 p-6 ${closing ? "animate-fade-out" : "animate-dialog-in"}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-display text-lg font-black uppercase">Remove profile picture?</h2>
              <button type="button" onClick={close} aria-label="Cancel"><X size={18} /></button>
            </div>
            <p className="text-sm leading-6 text-zinc-400">
              Your profile picture will be removed and replaced with your default avatar. This cannot be undone.
            </p>
            <form action={removeAvatar} className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={close}
                className="flex-1 border border-zinc-700 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-zinc-400 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-500 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-white transition hover:bg-red-400"
              >
                Remove
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
