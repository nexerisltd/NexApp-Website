"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, TriangleAlert, X } from "lucide-react";
import { deleteAccount } from "@/app/profile/actions";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await deleteAccount();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-card flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-danger transition-transform hover:scale-[1.03]"
      >
        <Trash2 size={15} /> Delete account
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && setOpen(false)}
            className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="neu-raised relative w-full max-w-sm rounded-3xl p-6"
            >
              <button
                onClick={() => !loading && setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text"
              >
                <X size={16} />
              </button>

              <span className="neu-pressed flex h-12 w-12 items-center justify-center rounded-full text-danger">
                <TriangleAlert size={20} />
              </span>

              <h3 className="mt-4 font-display text-lg font-bold">
                Delete your account?
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                This permanently deletes your NexApp account, your download
                history, and any admin access you have. Published apps you
                created will stay live. This can&apos;t be undone.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="neu-raised flex-1 rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 rounded-full bg-danger px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? "Deleting..." : "Yes, delete it"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
