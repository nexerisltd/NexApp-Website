"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function GoodbyeModal({ show }: { show: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(show);

  useEffect(() => {
    if (show) router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function close() {
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="neu-raised w-full max-w-sm rounded-3xl p-8 text-center"
          >
            <span className="neu-pressed mx-auto flex h-14 w-14 items-center justify-center rounded-full text-accent">
              <Heart size={22} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">
              We&apos;re sad to see you go
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Your NexApp account has been deleted. You&apos;re welcome back
              anytime.
            </p>
            <button
              onClick={close}
              className="neu-raised mt-6 rounded-full px-6 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
            >
              Okay
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
