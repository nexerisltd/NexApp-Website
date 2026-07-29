import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteApp, toggleStatus } from "@/app/admin/actions";
import SavedToast from "@/components/SavedToast";
import type { App } from "@/lib/types";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("apps")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <SavedToast saved={saved === "1"} />
      <div className="flex items-center justify-between">;
        <div>
          <h1 className="font-display text-2xl font-bold">Manage apps</h1>
          <p className="mt-1 text-sm text-text-muted">
            Publish, edit, or remove listings.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
        >
          + New app
        </Link>
      </div>

      <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
        {apps && apps.length > 0 ? (
          (apps as App[]).map((app) => (
            <div
              key={app.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
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
          ))
        ) : (
          <p className="py-10 text-center text-text-muted">
            No apps yet — create the first one.
          </p>
        )}
      </div>
    </div>
  );
}
