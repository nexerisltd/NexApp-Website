import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNexIdsByEmail } from "@/lib/nexauras";
import { submitIssueRequest } from "@/app/dashboard/issues/actions";
import FeedbackToast from "@/components/FeedbackToast";
import { AlertTriangle } from "lucide-react";

type AdminRow = { id: string; email: string; full_name: string | null };

export default async function NewIssueRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("dev_status")
    .eq("id", user.id)
    .single();

  if (profile?.dev_status !== "verified") {
    redirect("/apply-dev");
  }

  const [{ data: apps }, { data: admins }] = await Promise.all([
    supabase
      .from("apps")
      .select("id, name")
      .eq("created_by", user.id)
      .order("name"),
    supabase.rpc("list_admins"),
  ]);

  const nexIds = await getNexIdsByEmail(
    ((admins as AdminRow[] | null) ?? []).map((a) => a.email)
  );

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <FeedbackToast error={error} redirectTo="/dashboard/issues/new" />
      <h1 className="font-display text-2xl font-bold">Report an issue</h1>
      <p className="mt-1 text-sm text-text-muted">
        Send a direct request to a specific admin about a problem with one of your
        apps.
      </p>

      {!apps || apps.length === 0 ? (
        <div className="glass-card mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
          You don&apos;t have any published apps yet.
        </div>
      ) : (
        <form action={submitIssueRequest} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">App</label>
            <select
              name="app_id"
              required
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Send to
            </label>
            <select
              name="target_admin_id"
              required
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            >
              {((admins as AdminRow[] | null) ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name || a.email}
                  {nexIds[a.email] ? ` — ${nexIds[a.email]}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Issue title
            </label>
            <input
              name="title"
              required
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={4}
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-mono text-text-muted">
                Fix ETA — from
              </label>
              <input
                type="datetime-local"
                name="eta_start"
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-mono text-text-muted">
                Fix ETA — to
              </label>
              <input
                type="datetime-local"
                name="eta_end"
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="download_blocked"
              className="h-4 w-4 accent-danger"
            />
            Request that downloads be blocked until this is fixed
          </label>

          <div className="glass-card aurora-border flex gap-2 rounded-xl p-3 text-xs text-text-muted">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
            <p>
              One request per admin every 15 minutes, and one request per app every
              hour — this keeps the review queue useful for everyone.
            </p>
          </div>

          <button
            type="submit"
            className="self-start rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent"
          >
            Send request
          </button>
        </form>
      )}
    </div>
  );
}
