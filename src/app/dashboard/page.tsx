import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock3, LayoutGrid, ShieldCheck, ShieldX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { App } from "@/lib/types";

const STATUS_META: Record<
  string,
  { label: string; icon: typeof Clock3; className: string }
> = {
  pending: {
    label: "Pending review",
    icon: Clock3,
    className: "bg-amber-500/10 text-amber-500",
  },
  published: {
    label: "Published",
    icon: ShieldCheck,
    className: "bg-success/10 text-success",
  },
  declined: {
    label: "Declined",
    icon: ShieldX,
    className: "bg-danger/10 text-danger",
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: submissions } = await supabase
    .from("apps")
    .select("*, categories(id, name, slug)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const typedSubmissions = (submissions as App[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Developer dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track the apps you&apos;ve submitted and their review status.
          </p>
        </div>
        <Link
          href="/submit"
          className="rounded-full neu-raised px-4 py-2 text-xs font-medium text-accent transition-transform hover:scale-[1.03]"
        >
          Submit an app
        </Link>
      </div>

      <Link
        href="/dashboard/issues"
        className="glass-card aurora-border mt-6 flex items-center justify-between rounded-2xl px-5 py-3 text-sm transition-transform hover:scale-[1.01]"
      >
        <span>Report an issue on one of your apps, or check on a request</span>
        <span className="text-accent">View →</span>
      </Link>

      <div className="mt-8 flex flex-col gap-3">
        {typedSubmissions.length === 0 && (
          <div className="glass-card rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
            You haven&apos;t submitted any apps yet.{" "}
            <Link href="/submit" className="underline underline-offset-4">
              Submit your first one
            </Link>
            .
          </div>
        )}

        {typedSubmissions.map((app) => {
          const meta = STATUS_META[app.status] ?? STATUS_META.pending;
          const StatusIcon = meta.icon;
          return (
            <div key={app.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-text-muted">
                  {app.icon_url ? (
                    <Image
                      src={app.icon_url}
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LayoutGrid size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {app.status === "published" ? (
                      <Link
                        href={`/shop/${app.slug}`}
                        className="font-display text-sm font-bold hover:underline"
                      >
                        {app.name}
                      </Link>
                    ) : (
                      <p className="font-display text-sm font-bold">{app.name}</p>
                    )}
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${meta.className}`}
                    >
                      <StatusIcon size={11} />
                      {meta.label}
                    </span>
                  </div>
                  {app.tagline && (
                    <p className="mt-0.5 text-xs text-text-muted">{app.tagline}</p>
                  )}
                  {app.status === "declined" && app.review_note && (
                    <p className="mt-2 rounded-lg bg-danger/5 px-3 py-2 text-xs text-danger">
                      {app.review_note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
