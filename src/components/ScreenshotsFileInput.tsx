"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ScreenshotsFileInput({ existing = [] }: { existing?: string[] }) {
  const [kept, setKept] = useState<string[]>(existing);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeExisting(url: string) {
    setKept((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="existing_screenshots" value={JSON.stringify(kept)} />

      {(kept.length > 0 || newPreviews.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {kept.map((url) => (
            <div key={url} className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                aria-label="Remove screenshot"
                className="glass-strong absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {newPreviews.map((url, i) => (
            <div
              key={`new-${i}`}
              className="aurora-border relative h-20 w-32 shrink-0 overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span className="glass-strong absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 text-[10px]">
                new
              </span>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        name="screenshot_files"
        accept="image/png,image/jpeg"
        multiple
        onChange={handleChange}
        className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
      />

      {kept.length === 0 && newPreviews.length === 0 && (
        <p className="text-xs text-text-muted">
          No screenshots yet — add some PNG/JPEG files.
        </p>
      )}
    </div>
  );
}
