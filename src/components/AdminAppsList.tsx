"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteApp, toggleStatus, bulkSetStatus, bulkDelete } from "@/app/admin/actions";
import type { App } from "@/lib/types";

export default function AdminAppsList({ apps }: { apps: App[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = apps.length > 0 && selected.size === apps.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(apps.map((a) => a.id)));
  }

  function runBulk(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      setSelected(new Set());
    });
  }

  const selectedIds = Array.from(selected);

  return (
    <div>
      {selected.size > 0 && (
        <div className="glass-card sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              disabled={pending}
              onClick={() => runBulk(() => bulkSetStatus(selectedIds, "published"))}
              className="rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-medium text-success transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              Publish
            </button>
            <button
              disabled={pending}
              onClick={() => runBulk(() => bulkSetStatus(selectedIds, "draft"))}
              className="rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-text-muted transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              Unpublish
            </button>
            <button
              disabled={pending}
              onClick={() => {
                if (confirm(`Delete ${selected.size} app(s)? This can't be undone.`)) {
                  runBulk(() => bulkDelete(selectedIds));
                }
              }}
              className="rounded-full bg-danger/10 px-3.5 py-1.5 text-xs font-medium text-danger transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              Delete
            </button>
            {pending && <Loader2 size={14} className="animate-spin text-text-muted" />}
          </div>
        </div>
      )}

      <div className="flex flex-col divide-y divide-border border-y border-border">
        {apps.length > 0 ? (
          <>
            <div className="flex items-center gap-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-accent"
                aria-label="Select all"
              />
              <span className="text-xs text-text-muted">Select all</span>
            </div>

            {apps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(app.id)}
                    onChange={() => toggleOne(app.id)}
                    className="h-4 w-4 accent-accent"
                    aria-label={`Select ${app.name}`}
                  />
                  <div>
                    <p className="font-medium">
                      {app.name}{" "}
                      <span className="font-mono text-xs text-text-muted">
                        v{app.version}
                      </span>
                    </p>
                    <p className="text-xs text-text-muted">
                      {app.categories?.name ?? "Uncategorized"} ·{" "}
                      {app.downloads_count.toLocaleString()} downloads
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <form action={toggleStatus}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="status" value={app.status} />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-mono ${
                        app.status === "published"
                          ? "bg-success/15 text-success"
                          : "bg-surface-2 text-text-muted"
                      }`}
                    >
                      {app.status}
                    </button>
                  </form>
                  <Link
                    href={`/admin/${app.id}/edit`}
                    aria-label={`Edit ${app.name}`}
                    className="glass-card aurora-border flex h-9 w-9 items-center justify-center rounded-full text-text transition-transform hover:scale-105"
                  >
                    <Pencil size={14} />
                  </Link>
                  <form action={deleteApp}>
                    <input type="hidden" name="id" value={app.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${app.name}`}
                      className="glass-card flex h-9 w-9 items-center justify-center rounded-full text-danger transition-transform hover:scale-105"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="py-10 text-center text-text-muted">
            No apps yet — create the first one.
          </p>
        )}
      </div>
    </div>
  );
}
