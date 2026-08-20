import Link from "next/link";
import { Pencil, Trash2, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteBillboard } from "@/app/admin/billboards/actions";
import SavedToast from "@/components/SavedToast";
import type { Billboard } from "@/lib/types";

export default async function AdminBillboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: billboards } = await supabase
    .from("billboards")
    .select("*, apps(name, slug, icon_url, cover_url)")
    .order("display_order", { ascending: true });

  return (
    <div>
      <SavedToast saved={saved === "1"} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage billboards</h1>
          <p className="mt-1 text-sm text-text-muted">
            Curate the homepage hero carousel. Each billboard features one app — its
            icon, cover image, and page link are pulled from that app automatically.
          </p>
        </div>
        <Link
          href="/admin/billboards/new"
          className="rounded-full neu-raised px-5 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
        >
          + Add New Billboard
        </Link>
      </div>

      <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
        {billboards && billboards.length > 0 ? (
          (billboards as Billboard[]).map((billboard) => (
            <div
              key={billboard.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                  {billboard.apps?.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={billboard.apps.icon_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LayoutGrid size={16} className="text-text-muted" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {billboard.title}{" "}
                    {!billboard.active && (
                      <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-text-muted">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">
                    {billboard.apps?.name ?? "Unknown app"}
                    {billboard.offer ? ` · ${billboard.offer}` : ""} · order{" "}
                    {billboard.display_order}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/billboards/${billboard.id}/edit`}
                  aria-label="Edit billboard"
                  className="glass-card aurora-border flex h-9 w-9 items-center justify-center rounded-full text-text transition-transform hover:scale-105"
                >
                  <Pencil size={14} />
                </Link>
                <form action={deleteBillboard}>
                  <input type="hidden" name="id" value={billboard.id} />
                  <button
                    type="submit"
                    aria-label="Delete billboard"
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
              No billboards yet.
            </p>
            <p className="mt-3 text-sm">
              Click &quot;+ Add New Billboard&quot;, pick an app, and it&apos;ll appear
              in the homepage hero carousel.
            </p>
            <p className="mt-2 text-xs italic">
              !! Until you add one, the homepage falls back to its default slides !!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
