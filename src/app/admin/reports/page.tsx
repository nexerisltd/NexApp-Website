import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  resolveReport,
  dismissReport,
  unpublishReportedApp,
} from "@/app/admin/reports/actions";
import type { Report } from "@/lib/types";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam or misleading",
  malware: "Malware or unsafe",
  broken_link: "Broken download link",
  inappropriate: "Inappropriate content",
  copyright: "Copyright infringement",
  other: "Other",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*, apps(name, slug, icon_url), profiles(full_name)")
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const typedReports = (reports as Report[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-text-muted">
        Apps flagged by users. {typedReports.length} open.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {typedReports.length === 0 && (
          <p className="text-sm text-text-muted">No open reports right now.</p>
        )}

        {typedReports.map((report) => (
          <div key={report.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-text-muted">
                {report.apps?.icon_url ? (
                  <Image
                    src={report.apps.icon_url}
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
                  {report.apps?.slug ? (
                    <Link
                      href={`/shop/${report.apps.slug}`}
                      className="font-display text-sm font-bold hover:underline"
                    >
                      {report.apps?.name ?? "Unknown app"}
                    </Link>
                  ) : (
                    <p className="font-display text-sm font-bold">
                      {report.apps?.name ?? "Unknown app"}
                    </p>
                  )}
                  <span className="rounded-full bg-danger/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-danger">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  Reported by {report.profiles?.full_name ?? "a user"} ·{" "}
                  {new Date(report.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {report.details && (
                  <p className="mt-2 text-sm text-text-muted">{report.details}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <form action={resolveReport}>
                  <input type="hidden" name="id" value={report.id} />
                  <button
                    type="submit"
                    className="w-full rounded-full neu-raised px-4 py-2 text-xs font-medium text-accent transition-transform hover:scale-[1.03]"
                  >
                    Resolve
                  </button>
                </form>
                <form action={dismissReport}>
                  <input type="hidden" name="id" value={report.id} />
                  <button
                    type="submit"
                    className="w-full rounded-full px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:text-text"
                  >
                    Dismiss
                  </button>
                </form>
                {report.apps?.slug && (
                  <form action={unpublishReportedApp}>
                    <input type="hidden" name="id" value={report.id} />
                    <input type="hidden" name="app_id" value={report.app_id} />
                    <button
                      type="submit"
                      className="w-full rounded-full bg-danger/10 px-4 py-2 text-xs font-medium text-danger transition-transform hover:scale-[1.03]"
                    >
                      Unpublish app
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
