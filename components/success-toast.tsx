"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

export function SuccessToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  function dismiss() {
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => setVisible(false), 200);
  }

  useEffect(() => {
    const timer = window.setTimeout(dismiss, 6000);
    return () => {
      window.clearTimeout(timer);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[120] flex max-w-sm items-start gap-3 border border-lime/60 bg-zinc-950 p-4 shadow-2xl ${
        leaving ? "animate-toast-out" : "animate-toast-in"
      }`}
    >
      <span className="animate-pop-in flex h-8 w-8 shrink-0 items-center justify-center bg-lime text-ink">
        <Check size={17} strokeWidth={3} />
      </span>
      <p className="pt-1 text-sm font-semibold leading-6 text-white">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss success message"
        className="ml-auto p-1 text-zinc-500 hover:text-white"
      >
        <X size={15} />
      </button>
    </div>
  );
}
