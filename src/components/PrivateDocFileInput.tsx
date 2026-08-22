"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { uploadPrivateDoc } from "@/lib/uploadClient";
import UploadProgress, { type UploadState } from "@/components/UploadProgress";
import { useUploadBusySetter } from "@/lib/uploadTracker";

export default function PrivateDocFileInput({
  fieldName,
  label,
  folder,
}: {
  fieldName: string;
  label: string;
  folder: "gov_id" | "selfie";
}) {
  const [path, setPath] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const setBusy = useUploadBusySetter(fieldName);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setState({ status: "uploading", pct: 0 });
    setBusy(true);

    try {
      const storagePath = await uploadPrivateDoc(file, {
        folder,
        onProgress: (pct) => setState({ status: "uploading", pct }),
      });
      setPath(storagePath);
      setState({ status: "done" });
    } catch (err) {
      setState({ status: "error", message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={fieldName} value={path ?? ""} />
      <label className="mb-0.5 block text-xs font-mono text-text-muted">{label}</label>
      <div className="flex items-center gap-3">
        <div className="glass-card aurora-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ShieldAlert size={18} className="text-text-muted" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            type="file"
            accept="image/png,image/jpeg"
            required
            onChange={handleChange}
            className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
          />
          <UploadProgress state={state} />
        </div>
      </div>
      <p className="text-[11px] text-text-muted">
        Stored privately — visible only to you and our verified review team, never
        published or shown on your public profile.
      </p>
    </div>
  );
}
