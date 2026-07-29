"use client";

import { useState } from "react";
import { Plus, Trash2, Monitor, Smartphone, Globe } from "lucide-react";
import type { PlatformGroup, PlatformLink } from "@/lib/types";

const PRESETS: { label: string; group: PlatformGroup }[] = [
  { label: "Windows", group: "desktop" },
  { label: "Linux", group: "desktop" },
  { label: "macOS", group: "desktop" },
  { label: "APK", group: "mobile" },
];

const GROUP_ICON: Record<PlatformGroup, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  web: Globe,
  other: Globe,
};

export default function PlatformLinksEditor({
  initialLinks = [],
}: {
  initialLinks?: PlatformLink[];
}) {
  const [links, setLinks] = useState<PlatformLink[]>(initialLinks);
  const [customLabel, setCustomLabel] = useState("");
  const [customGroup, setCustomGroup] = useState<PlatformGroup>("other");

  function addLink(label: string, group: PlatformGroup) {
    if (!label.trim()) return;
    if (links.some((l) => l.label.toLowerCase() === label.toLowerCase())) return;
    setLinks((prev) => [...prev, { label: label.trim(), group, url: "" }]);
  }

  function updateUrl(label: string, url: string) {
    setLinks((prev) => prev.map((l) => (l.label === label ? { ...l, url } : l)));
  }

  function removeLink(label: string) {
    setLinks((prev) => prev.filter((l) => l.label !== label));
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="platform_links" value={JSON.stringify(links)} />

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          Quick add
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const already = links.some(
              (l) => l.label.toLowerCase() === preset.label.toLowerCase()
            );
            return (
              <button
                key={preset.label}
                type="button"
                disabled={already}
                onClick={() => addLink(preset.label, preset.group)}
                className="glass-card aurora-border rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                + {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          Add a custom platform
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Chrome Extension"
            className="aurora-border glass-card min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none"
          />
          <select
            value={customGroup}
            onChange={(e) => setCustomGroup(e.target.value as PlatformGroup)}
            className="aurora-border glass-card rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="web">Web</option>
            <option value="other">Other</option>
          </select>
          <button
            type="button"
            onClick={() => {
              addLink(customLabel, customGroup);
              setCustomLabel("");
            }}
            className="flex items-center gap-1 rounded-xl bg-surface-2 px-3 py-2 text-sm font-medium"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {links.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-text-muted">
            Download links (paste the URL for each)
          </label>
          {links.map((link) => {
            const Icon = GROUP_ICON[link.group] ?? Globe;
            return (
              <div key={link.label} className="flex items-center gap-2">
                <span className="glass-card aurora-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Icon size={14} />
                </span>
                <span className="w-24 shrink-0 truncate text-sm">{link.label}</span>
                <input
                  type="url"
                  required
                  value={link.url}
                  onChange={(e) => updateUrl(link.label, e.target.value)}
                  placeholder="https://..."
                  className="aurora-border glass-card min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeLink(link.label)}
                  aria-label={`Remove ${link.label}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger hover:opacity-80"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {links.length === 0 && (
        <p className="text-xs text-text-muted">
          Add at least one platform above, then paste its download link.
        </p>
      )}
    </div>
  );
}
