"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { uploadImage, type UploadScope } from "@/lib/uploadClient";
import UploadProgress, { type UploadState } from "@/components/UploadProgress";
import { useUploadBusySetter } from "@/lib/uploadTracker";

export default function IconFileInput({
  existingUrl,
  uploadScope = "admin",
}: {
  existingUrl?: string | null;
  uploadScope?: UploadScope;
}) {
  const [url, setUrl] = useState<string | null>(existingUrl ?? null);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const setBusy = useUploadBusySetter("icon");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setState({ status: "uploading", pct: 0 });
    setBusy(true);

    try {
      const publicUrl = await uploadImage(file, {
        folder: "icons",
        scope: uploadScope,
        onProgress: (pct) => setState({ status: "uploading", pct }),
      });
      setUrl(publicUrl);
      setState({ status: "done" });
    } catch (err) {
      setState({ status: "error", message: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name="icon_url" value={url ?? ""} />
      <div className="glass-card aurora-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={20} className="text-text-muted" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleChange}
          className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
        />
        <UploadProgress state={state} />
      </div>
    </div>
  );
}
