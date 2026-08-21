"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useAnyUploadBusy } from "@/lib/uploadTracker";

export default function SubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  // useFormStatus reflects the real, in-flight state of the parent <form>'s
  // action — not a manually-tracked boolean — so it can never drift out of
  // sync with what's actually happening on submit.
  const { pending } = useFormStatus();
  // Uploads happen client-side before the form is submitted (see
  // uploadTracker) — block submission while any of them are still in
  // flight so a save can never race ahead of its own file uploads.
  const uploadsBusy = useAnyUploadBusy();
  const disabled = pending || uploadsBusy;

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`relative mt-2 flex items-center justify-center gap-2 self-start overflow-hidden rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent transition-transform disabled:cursor-not-allowed disabled:opacity-70 ${
        disabled ? "" : "hover:scale-[1.02]"
      } ${className}`}
    >
      {(pending || uploadsBusy) && <Loader2 size={14} className="animate-spin" />}
      {pending ? pendingLabel ?? "Saving…" : uploadsBusy ? "Uploading…" : children}
    </button>
  );
}
