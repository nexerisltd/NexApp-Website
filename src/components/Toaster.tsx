"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { takePendingToast, type ToastType } from "@/lib/toast";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ICON_COLOR: Record<ToastType, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-text-muted",
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function show(message: string, type: ToastType) {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }

    // Catch a toast that fired before this component finished mounting
    // (e.g. right after a server-action redirect to a fresh page).
    const pending = takePendingToast();
    if (pending) show(pending.message, pending.type);

    function handle(e: Event) {
      const { message, type } = (e as CustomEvent).detail as {
        message: string;
        type: ToastType;
      };
      show(message, type);
    }

    window.addEventListener("nexapp-toast", handle);
    return () => window.removeEventListener("nexapp-toast", handle);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="glass-strong aurora-border pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm shadow-lg"
            >
              <Icon size={16} className={ICON_COLOR[t.type]} />
              {t.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
