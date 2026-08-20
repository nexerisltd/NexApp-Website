"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

export default function CoverFileInput({ existingUrl }: { existingUrl?: string | null }) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="existing_cover_url" value={existingUrl ?? ""} />
      <div className="glass-card aurora-border flex aspect-[21/9] w-full max-w-md items-center justify-center overflow-hidden rounded-xl">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-text-muted">
            <ImagePlus size={20} />
            <span className="text-xs">21:9 cover preview</span>
          </div>
        )}
      </div>
      <input
        type="file"
        name="cover_file"
        accept="image/png,image/jpeg"
        onChange={handleChange}
        className="aurora-border glass-card w-full max-w-md rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
      />
      <p className="text-xs text-text-muted">
        Recommended size <strong>1680&times;720px</strong> (21:9 ratio) — this is the same
        ratio as the homepage hero billboard, so it&apos;s used as-is when this app is
        featured there.
      </p>
    </div>
  );
}
