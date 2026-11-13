"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function SuccessToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-start gap-3 border border-lime/60 bg-zinc-950 p-4 shadow-2xl"
        >
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-lime text-ink"
          >
            <Check size={17} strokeWidth={3} />
          </motion.span>
          <p className="pt-1 text-sm font-semibold leading-6 text-white">{message}</p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss success message"
            className="ml-auto p-1 text-zinc-500 hover:text-white"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
