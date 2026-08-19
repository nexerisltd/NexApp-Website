"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Search } from "lucide-react";

type AppOption = { id: string; name: string; icon_url: string | null; app_code: string };

export default function AppPicker({
  apps,
  initialAppId,
}: {
  apps: AppOption[];
  initialAppId?: string;
}) {
  const initial = apps.find((a) => a.id === initialAppId) ?? null;
  const [selected, setSelected] = useState<AppOption | null>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.app_code.includes(q)
    );
  }, [apps, query]);

  return (
    <div className="relative">
      <input type="hidden" name="app_id" value={selected?.id ?? ""} required />

      {selected ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="aurora-border glass-card flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
            {selected.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.icon_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <LayoutGrid size={14} className="text-text-muted" />
            )}
          </span>
          {selected.name}
          <span className="ml-auto font-mono text-xs text-text-muted">
            {selected.app_code}
          </span>
          <span className="text-xs text-text-muted">Change</span>
        </button>
      ) : (
        <div className="aurora-border glass-card flex items-center gap-2 rounded-xl px-4 py-2.5">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search apps by name or App ID..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      )}

      {open && !selected && (
        <div className="glass-strong aurora-border absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl p-1.5">
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-text-muted">No apps match.</p>
          )}
          {filtered.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                setSelected(app);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                {app.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.icon_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <LayoutGrid size={12} className="text-text-muted" />
                )}
              </span>
              {app.name}
              <span className="ml-auto font-mono text-[10px] text-text-muted">
                {app.app_code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
