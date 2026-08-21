import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FeedbackToast from "@/components/FeedbackToast";
import IssueStatusBadge from "@/components/IssueStatusBadge";
import type { IssueRequest } from "@/lib/types";

export default async function DevIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: requests } = await supabase
    .from("issue_requests")
    .select("*, apps(name, slug, icon_url), target_admin:target_admin_id(full_name, avatar_url)")
    .eq("requested_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <FeedbackToast saved={saved === "1"} successMessage="Request sent." redirectTo="/dashboard/issues" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Your issue requests</h1>
        <Link
          href="/dashboard/issues/new"
          className="rounded-full neu-raised px-4 py-2 text-xs font-medium text-accent"
        >
          + New request
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {requests && requests.length > 0 ? (
          (requests as IssueRequest[]).map((r) => (
            <div key={r.id} className="glass-card aurora-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={13} className="text-danger" /> {r.title}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {r.apps?.name} · sent to {r.target_admin?.full_name || "an admin"}
                  </p>
                </div>
                <IssueStatusBadge id={r.id} initialStatus={r.status} />
              </div>
              <p className="mt-2 text-sm text-text-muted">{r.description}</p>
              {r.status_note && (
                <p className="mt-2 rounded-lg bg-surface-2 p-2.5 text-xs text-text-muted">
                  <strong className="text-text">Admin note:</strong> {r.status_note}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
            No issue requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
