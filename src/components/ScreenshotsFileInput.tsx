"use client";

import { useState } from "react";
import { X, Monitor, Smartphone, Globe } from "lucide-react";
import type { PlatformGroup, Screenshot } from "@/lib/types";

const GROUP_OPTIONS: { value: PlatformGroup; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "web", label: "Web", icon: Globe },
  { value: "other", label: "Other", icon: Globe },
];

export default function ScreenshotsFileInput({
  existing = [],
}: {
  existing?: Screenshot[];
}) {
  const [kept, setKept] = useState<Screenshot[]>(existing);
  const [newFiles, setNewFiles] = useState<{ previewUrl: string; group: PlatformGroup }[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles(
      files.map((f) => ({ previewUrl: URL.createObjectURL(f), group: "desktop" as PlatformGroup }))
    );
  }

  function removeExisting(url: string) {
    setKept((prev) => prev.filter((s) => s.url !== url));
  }

  function setExistingGroup(url: string, group: PlatformGroup) {
    setKept((prev) => prev.map((s) => (s.url === url ? { ...s, group } : s)));
  }

  function setNewGroup(index: number, group: PlatformGroup) {
    setNewFiles((prev) => prev.map((f, i) => (i === index ? { ...f, group } : f)));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="existing_screenshots" value={JSON.stringify(kept)} />
      <input
        type="hidden"
        name="screenshot_groups"
        value={JSON.stringify(newFiles.map((f) => f.group))}
      />

      <p className="text-xs text-text-muted">
        Tag each screenshot with a platform — the app page shows the set that matches
        whichever platform the visitor has selected.
      </p>

      {(kept.length > 0 || newFiles.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {kept.map((shot) => (
            <div key={shot.url} className="flex w-32 shrink-0 flex-col gap-1.5">
              <div className="group relative h-20 w-32 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExisting(shot.url)}
                  aria-label="Remove screenshot"
                  className="glass-strong absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={11} />
                </button>
              </div>
              <select
                value={shot.group}
                onChange={(e) => setExistingGroup(shot.url, e.target.value as PlatformGroup)}
                className="aurora-border glass-card w-full rounded-lg px-2 py-1 text-[11px] outline-none"
              >
                {GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {newFiles.map((file, i) => (
            <div key={`new-${i}`} className="flex w-32 shrink-0 flex-col gap-1.5">
              <div className="aurora-border relative h-20 w-32 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.previewUrl} alt="" className="h-full w-full object-cover" />
                <span className="glass-strong absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 text-[10px]">
                  new
                </span>
              </div>
              <select
                value={file.group}
                onChange={(e) => setNewGroup(i, e.target.value as PlatformGroup)}
                className="aurora-border glass-card w-full rounded-lg px-2 py-1 text-[11px] outline-none"
              >
                {GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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

      {kept.length === 0 && newFiles.length === 0 && (
        <p className="text-xs text-text-muted">
          No screenshots yet — add some PNG/JPEG files.
        </p>
      )}
    </div>
  );
}
