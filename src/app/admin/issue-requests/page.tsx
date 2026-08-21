import { AlertTriangle, Clock, Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  claimIssueRequest,
  updateIssueRequestStatus,
} from "@/app/admin/issue-requests/actions";
import FeedbackToast from "@/components/FeedbackToast";
import IssueStatusBadge from "@/components/IssueStatusBadge";
import type { IssueRequest } from "@/lib/types";

const TEN_MIN_MS = 10 * 60 * 1000;

export default async function AdminIssueRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from("issue_requests")
    .select(
      "*, apps(name, slug, icon_url), requester:requested_by(full_name, avatar_url), target_admin:target_admin_id(full_name, avatar_url)"
    )
    .order("created_at", { ascending: false });

  const list = (requests as IssueRequest[] | null) ?? [];
  const open = list.filter((r) => r.status === "pending" || r.status === "testing");
  const resolved = list.filter((r) => r.status === "granted" || r.status === "denied");

  return (
    <div>
      <FeedbackToast
        saved={saved === "1"}
        error={error}
        successMessage="Updated"
        redirectTo="/admin/issue-requests"
      />
      <h1 className="font-display text-2xl font-bold">Issue requests</h1>
      <p className="mt-1 text-sm text-text-muted">
        Every request from every developer, to every admin — visible to the whole team.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {open.length > 0 ? (
          open.map((r) => {
            const isMine = r.target_admin_id === user?.id;
            const claimable =
              r.status === "pending" &&
              !isMine &&
              Date.now() - new Date(r.assigned_at).getTime() > TEN_MIN_MS;

            return (
              <div key={r.id} className="glass-card aurora-border rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle size={14} className="text-danger" /> {r.title}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {r.apps?.name} · from {r.requester?.full_name || "a developer"} ·
                      assigned to {r.target_admin?.full_name || "—"}
                      {r.download_blocked && (
                        <span className="ml-2 inline-flex items-center gap-1 text-danger">
                          <Ban size={10} /> wants downloads blocked
                        </span>
                      )}
                    </p>
                    {(r.eta_start || r.eta_end) && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={11} />
                        {r.eta_start ? new Date(r.eta_start).toLocaleString() : "—"}
                        {" → "}
                        {r.eta_end ? new Date(r.eta_end).toLocaleString() : "—"}
                      </p>
                    )}
                  </div>
                  <IssueStatusBadge id={r.id} initialStatus={r.status} />
                </div>

                <p className="mt-3 text-sm text-text-muted">{r.description}</p>

                {isMine ? (
                  <form
                    action={updateIssueRequestStatus}
                    className="mt-4 flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      name="status_note"
                      placeholder="Optional note for the developer…"
                      className="aurora-border glass-card min-w-[160px] flex-1 rounded-full px-3 py-2 text-xs outline-none"
                    />
                    <button
                      type="submit"
                      name="status"
                      value="testing"
                      className="rounded-full bg-accent/10 px-3 py-2 text-xs font-medium text-accent"
                    >
                      Testing
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="granted"
                      className="rounded-full bg-success/10 px-3 py-2 text-xs font-medium text-success"
                    >
                      Grant & apply
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="denied"
                      className="rounded-full bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
                    >
                      Deny & dismiss
                    </button>
                  </form>
                ) : claimable ? (
                  <form action={claimIssueRequest} className="mt-4">
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-full neu-raised px-4 py-2 text-xs font-medium text-accent"
                    >
                      Claim — unanswered 10+ min
                    </button>
                  </form>
                ) : (
                  r.status === "pending" && (
                    <p className="mt-4 text-xs text-text-muted">
                      Waiting on {r.target_admin?.full_name || "the assigned admin"} — claimable
                      by others after 10 minutes of no response.
                    </p>
                  )
                )}
              </div>
            );
          })
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
            No open issue requests.
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-sm font-semibold text-text-muted">
            Resolved
          </h2>
          <div className="mt-3 flex flex-col divide-y divide-border border-y border-border">
            {resolved.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-text-muted">
                    {r.apps?.name} · {r.requester?.full_name}
                  </p>
                </div>
                <IssueStatusBadge id={r.id} initialStatus={r.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
