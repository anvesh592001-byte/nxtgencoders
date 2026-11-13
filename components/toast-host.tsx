"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

export const TOAST_EVENT = "nxtgen:toast";

/** Show a toast that survives card unmounts and route changes. */
export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}

export function ToastHost() {
  const [toast, setToast] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | null>(null);
  const leaveTimer = useRef<number | null>(null);

  function dismiss() {
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => {
      setToast(null);
      setLeaving(false);
    }, 200);
  }

  useEffect(() => {
    function onToast(event: Event) {
      if (timer.current) window.clearTimeout(timer.current);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      setLeaving(false);
      setToast((event as CustomEvent<string>).detail || null);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    timer.current = window.setTimeout(dismiss, 5000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [toast]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    },
    []
  );

  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-start gap-3 border border-lime/60 bg-zinc-950 p-4 shadow-2xl ${
        leaving ? "animate-toast-out" : "animate-toast-in"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-lime text-ink">
        <Check size={17} strokeWidth={3} />
      </span>
      <p className="pt-1 text-sm font-semibold leading-6 text-white">{toast}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="ml-auto p-1 text-zinc-500 hover:text-white"
      >
        <X size={15} />
      </button>
    </div>
  );
}
