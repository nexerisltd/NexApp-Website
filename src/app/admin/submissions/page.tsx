import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { approveSubmission, rejectSubmission } from "@/app/admin/submissions/actions";
import type { App } from "@/lib/types";

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("apps")
    .select("*, categories(id, name, slug), profiles(full_name, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const typedSubmissions = (submissions as App[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Submissions</h1>
      <p className="mt-1 text-sm text-text-muted">
        Apps submitted by users, waiting for review. {typedSubmissions.length} pending.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {typedSubmissions.length === 0 && (
          <p className="text-sm text-text-muted">Nothing waiting for review right now.</p>
        )}

        {typedSubmissions.map((app) => (
          <div key={app.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-text-muted">
                {app.icon_url ? (
                  <Image
                    src={app.icon_url}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LayoutGrid size={22} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold">{app.name}</p>
                {app.tagline && (
                  <p className="text-sm text-text-muted">{app.tagline}</p>
                )}
                <p className="mt-1 font-mono text-xs text-text-muted">
                  by {app.profiles?.full_name ?? "Unknown"} · v{app.version} ·{" "}
                  {app.categories?.name ?? "Uncategorized"} ·{" "}
                  {app.platform_links.length} platform link
                  {app.platform_links.length === 1 ? "" : "s"}
                </p>
                {app.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                    {app.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <form action={approveSubmission}>
                  <input type="hidden" name="id" value={app.id} />
                  <button
                    type="submit"
                    className="w-full rounded-full neu-raised px-4 py-2 text-xs font-medium text-accent transition-transform hover:scale-[1.03]"
                  >
                    Approve
                  </button>
                </form>
                <details className="group">
                  <summary className="cursor-pointer list-none rounded-full px-4 py-2 text-center text-xs font-medium text-text-muted transition-colors hover:text-danger">
                    Reject
                  </summary>
                  <form action={rejectSubmission} className="mt-2 flex w-56 flex-col gap-2">
                    <input type="hidden" name="id" value={app.id} />
                    <textarea
                      name="review_note"
                      placeholder="Reason (optional, shown to the submitter)"
                      rows={2}
                      className="aurora-border glass-card rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-danger/10 px-4 py-2 text-xs font-medium text-danger transition-transform hover:scale-[1.03]"
                    >
                      Confirm reject
                    </button>
                  </form>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
