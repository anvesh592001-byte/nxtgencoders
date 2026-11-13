"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export const TOAST_EVENT = "nxtgen:toast";

/** Show a toast that survives card unmounts and route changes. */
export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}

export function ToastHost() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    function onToast(event: Event) {
      setToast((event as CustomEvent<string>).detail || null);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-start gap-3 border border-lime/60 bg-zinc-950 p-4 shadow-2xl"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-lime text-ink">
            <Check size={17} strokeWidth={3} />
          </span>
          <p className="pt-1 text-sm font-semibold leading-6 text-white">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="ml-auto p-1 text-zinc-500 hover:text-white"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
