import Link from "next/link";
import { Pencil, Trash2, GitBranch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteSource } from "@/app/admin/source/actions";
import SavedToast from "@/components/SavedToast";
import type { Source } from "@/lib/types";

export default async function AdminSourcePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: sources } = await supabase
    .from("sources")
    .select("*, apps(name, slug, icon_url)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <SavedToast saved={saved === "1"} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage sources</h1>
          <p className="mt-1 text-sm text-text-muted">
            Link a GitHub repository to an app. The link shows up on that app&apos;s page.
          </p>
        </div>
        <Link
          href="/admin/source/new"
          className="rounded-full bg-text px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
        >
          + Add New Source
        </Link>
      </div>

      <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
        {sources && sources.length > 0 ? (
          (sources as Source[]).map((source) => (
            <div
              key={source.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                  {source.apps?.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={source.apps.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <GitBranch size={16} className="text-text-muted" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{source.apps?.name ?? "Unknown app"}</p>
                  <a
                    href={source.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-text-muted underline"
                  >
                    {source.github_url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/source/${source.id}/edit`}
                  aria-label="Edit source"
                  className="glass-card aurora-border flex h-9 w-9 items-center justify-center rounded-full text-text transition-transform hover:scale-105"
                >
                  <Pencil size={14} />
                </Link>
                <form action={deleteSource}>
                  <input type="hidden" name="id" value={source.id} />
                  <button
                    type="submit"
                    aria-label="Delete source"
                    className="glass-card flex h-9 w-9 items-center justify-center rounded-full text-danger transition-transform hover:scale-105"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card my-6 rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
            <p className="font-display text-lg font-semibold text-text">
              No Source post yet.
            </p>
            <p className="mt-3 text-sm">
              Click &quot;+ Add New Source&quot;, select an app, and paste its GitHub
              repository link.
            </p>
            <p className="mt-2 text-xs italic">
              !! The source link will be shown on that app&apos;s page !!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
