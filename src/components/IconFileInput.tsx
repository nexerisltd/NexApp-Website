"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

export default function IconFileInput({ existingUrl }: { existingUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name="existing_icon_url" value={existingUrl ?? ""} />
      <div className="glass-card aurora-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={20} className="text-text-muted" />
        )}
      </div>
      <input
        type="file"
        name="icon_file"
        accept="image/png,image/jpeg"
        onChange={handleChange}
        className="aurora-border glass-card min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
      />
    </div>
  );
}