"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, Loader2, X } from "lucide-react";
import { submitReport } from "@/app/shop/[slug]/report-actions";
import { toast } from "@/lib/toast";

const REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "malware", label: "Malware or unsafe" },
  { value: "broken_link", label: "Download link is broken" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "copyright", label: "Copyright infringement" },
  { value: "other", label: "Something else" },
];

export default function ReportButton({ appId }: { appId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setPending(true);
    const { error } = await submitReport({ appId, reason, details });
    setPending(false);
    if (error) {
      toast(error, "error");
    } else {
      setSubmitted(true);
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setDetails("");
      setReason("spam");
    }, 200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-danger"
      >
        <Flag size={13} />
        Report this app
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong aurora-border w-full max-w-sm rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {submitted ? "Thanks for the report" : "Report this app"}
                </p>
                <button onClick={close} className="text-text-muted hover:text-text">
                  <X size={16} />
                </button>
              </div>

              {submitted ? (
                <p className="mt-4 text-sm text-text-muted">
                  Our team will take a look. You can close this now.
                </p>
              ) : (
                <>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="aurora-border glass-card mt-4 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  >
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Any extra details (optional)"
                    rows={3}
                    maxLength={500}
                    className="aurora-border glass-card mt-3 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:text-text-muted"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={pending}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-danger/10 px-4 py-2.5 text-xs font-medium text-danger transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {pending && <Loader2 size={13} className="animate-spin" />}
                    Submit report
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
