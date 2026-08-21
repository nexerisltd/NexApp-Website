import { UserCheck, UserX, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { approveDevApplication, rejectDevApplication } from "@/app/admin/developers/actions";
import FeedbackToast from "@/components/FeedbackToast";
import type { Profile } from "@/lib/types";

export default async function AdminDevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select("*")
    .eq("dev_status", "pending")
    .order("id");

  const { data: verified } = await supabase
    .from("profiles")
    .select("*")
    .eq("dev_status", "verified")
    .order("full_name");

  return (
    <div>
      <FeedbackToast
        saved={saved === "1"}
        error={error}
        successMessage="Application updated"
        redirectTo="/admin/developers"
      />
      <h1 className="font-display text-2xl font-bold">Developer applications</h1>
      <p className="mt-1 text-sm text-text-muted">
        Review outside developers before they can submit apps, report issues to an
        admin, or build a public profile.
      </p>

      <h2 className="mt-8 flex items-center gap-1.5 font-display text-sm font-semibold text-text-muted">
        <Clock size={13} /> Pending ({pending?.length ?? 0})
      </h2>
      <div className="mt-3 flex flex-col divide-y divide-border border-y border-border">
        {pending && pending.length > 0 ? (
          (pending as Profile[]).map((p) => (
            <div key={p.id} className="flex flex-col gap-3 py-4">
              <div>
                <p className="font-medium">{p.full_name || "Unnamed"}</p>
                {p.dev_application_note && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">
                    {p.dev_application_note}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={approveDevApplication}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-success/10 px-4 py-2 text-xs font-medium text-success"
                  >
                    <UserCheck size={13} /> Approve
                  </button>
                </form>
                <form action={rejectDevApplication} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    name="reason"
                    required
                    placeholder="Reason for rejecting…"
                    className="aurora-border glass-card rounded-full px-3 py-2 text-xs outline-none"
                  />
                  <button
                    type="submit"
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-danger/10 px-4 py-2 text-xs font-medium text-danger"
                  >
                    <UserX size={13} /> Reject
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-text-muted">No pending applications.</p>
        )}
      </div>

      <h2 className="mt-10 font-display text-sm font-semibold text-text-muted">
        Verified developers ({verified?.length ?? 0})
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {(verified as Profile[] | null)?.map((p) => (
          <span
            key={p.id}
            className="glass-card aurora-border rounded-full px-3 py-1.5 text-xs"
          >
            {p.full_name || "Unnamed"}
          </span>
        ))}
      </div>
    </div>
  );
}
