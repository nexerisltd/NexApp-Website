"use client";

import { useState } from "react";
import { X, Monitor, Smartphone, Globe, Loader2, AlertCircle } from "lucide-react";
import type { PlatformGroup, Screenshot } from "@/lib/types";
import { uploadImage, type UploadScope } from "@/lib/uploadClient";
import { useUploadBusySetter } from "@/lib/uploadTracker";

const GROUP_OPTIONS: { value: PlatformGroup; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "web", label: "Web", icon: Globe },
  { value: "other", label: "Other", icon: Globe },
];

type NewItem = {
  key: string;
  previewUrl: string;
  group: PlatformGroup;
  status: "uploading" | "done" | "error";
  pct: number;
  url?: string;
  error?: string;
};

export default function ScreenshotsFileInput({
  existing = [],
  uploadScope = "admin",
}: {
  existing?: Screenshot[];
  uploadScope?: UploadScope;
}) {
  const [kept, setKept] = useState<Screenshot[]>(existing);
  const [items, setItems] = useState<NewItem[]>([]);
  const setBusy = useUploadBusySetter("screenshots");

  const uploadingCount = items.filter((i) => i.status === "uploading").length;

  function updateItem(key: string, patch: Partial<NewItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10);
    const newItems: NewItem[] = files.map((f) => ({
      key: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(f),
      group: "desktop",
      status: "uploading",
      pct: 0,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setBusy(true);

    await Promise.all(
      files.map(async (file, i) => {
        const key = newItems[i].key;
        try {
          const url = await uploadImage(file, {
            folder: "screenshots",
            scope: uploadScope,
            onProgress: (pct) => updateItem(key, { pct }),
          });
          updateItem(key, { status: "done", url });
        } catch (err) {
          updateItem(key, { status: "error", error: (err as Error).message });
        }
      })
    );

    setBusy(false);
    // Clear the picker so selecting the same file again re-triggers onChange.
    e.target.value = "";
  }

  function removeExisting(url: string) {
    setKept((prev) => prev.filter((s) => s.url !== url));
  }

  function removeNew(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function setExistingGroup(url: string, group: PlatformGroup) {
    setKept((prev) => prev.map((s) => (s.url === url ? { ...s, group } : s)));
  }

  function setNewGroup(key: string, group: PlatformGroup) {
    updateItem(key, { group });
  }

  const screenshotsJson = JSON.stringify([
    ...kept,
    ...items
      .filter((i) => i.status === "done" && i.url)
      .map((i) => ({ url: i.url as string, group: i.group })),
  ]);

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="screenshots_json" value={screenshotsJson} />

      <p className="text-xs text-text-muted">
        Tag each screenshot with a platform — the app page shows the set that matches
        whichever platform the visitor has selected.
      </p>

      {(kept.length > 0 || items.length > 0) && (
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
          {items.map((item) => (
            <div key={item.key} className="flex w-32 shrink-0 flex-col gap-1.5">
              <div className="aurora-border relative h-20 w-32 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55">
                    <Loader2 size={16} className="animate-spin text-white" />
                    <div className="liquid-progress-track w-16">
                      <div
                        className="liquid-progress-fill"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                )}
                {item.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 px-2 text-center">
                    <AlertCircle size={16} className="text-danger" />
                    <span className="text-[9px] text-white">{item.error}</span>
                  </div>
                )}
                {item.status === "done" && (
                  <span className="glass-strong absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 text-[10px]">
                    new
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeNew(item.key)}
                  aria-label="Remove screenshot"
                  className="glass-strong absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                >
                  <X size={11} />
                </button>
              </div>
              <select
                value={item.group}
                onChange={(e) => setNewGroup(item.key, e.target.value as PlatformGroup)}
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
        accept="image/png,image/jpeg"
        multiple
        onChange={handleChange}
        className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
      />

      {uploadingCount > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <Loader2 size={11} className="animate-spin" />
          Uploading {uploadingCount} screenshot{uploadingCount > 1 ? "s" : ""}…
        </p>
      )}

      {kept.length === 0 && items.length === 0 && (
        <p className="text-xs text-text-muted">
          No screenshots yet — add some PNG/JPEG files.
        </p>
      )}
    </div>
  );
}
