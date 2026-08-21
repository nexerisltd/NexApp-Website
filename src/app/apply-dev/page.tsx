import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { applyForDev } from "@/app/apply-dev/actions";
import FeedbackToast from "@/components/FeedbackToast";
import type { Profile } from "@/lib/types";

export default async function ApplyDevPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const p = profile as Profile;

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <FeedbackToast
        error={error}
        saved={saved === "1"}
        successMessage="Application submitted."
        redirectTo="/apply-dev"
      />
      <h1 className="font-display text-2xl font-bold">Developer access</h1>
      <p className="mt-1 text-sm text-text-muted">
        Verified developers can submit apps, report issues directly to an admin, and
        build a public developer profile.
      </p>

      {p.dev_status === "verified" && (
        <div className="glass-card mt-8 flex items-start gap-3 rounded-2xl border border-success/40 bg-success/5 p-5">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" />
          <div>
            <p className="font-medium">You&apos;re a verified developer.</p>
            <p className="mt-1 text-sm text-text-muted">
              Head to your{" "}
              <Link href="/dashboard" className="text-accent underline">
                developer dashboard
              </Link>{" "}
              to submit apps or report an issue to an admin.
            </p>
          </div>
        </div>
      )}

      {p.dev_status === "pending" && (
        <div className="glass-card mt-8 flex items-start gap-3 rounded-2xl border border-border p-5">
          <Clock size={20} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="font-medium">Verifying…</p>
            <p className="mt-1 text-sm text-text-muted">
              An admin is reviewing your application. You&apos;ll get a notification
              once there&apos;s a decision.
            </p>
          </div>
        </div>
      )}

      {p.dev_status === "rejected" && (
        <div className="glass-card mt-8 flex flex-col gap-3 rounded-2xl border border-danger/40 bg-danger/5 p-5">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="font-medium">Your application wasn&apos;t approved.</p>
              {p.dev_reject_reason && (
                <p className="mt-1 text-sm text-text-muted">
                  Reason from the review team: &quot;{p.dev_reject_reason}&quot;
                </p>
              )}
            </div>
          </div>
          <form action={applyForDev} className="flex flex-col gap-3">
            <textarea
              name="note"
              required
              rows={4}
              placeholder="Tell us about yourself and what you'd like to build or maintain on NexApp…"
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              className="self-start rounded-full neu-raised px-5 py-2.5 text-sm font-medium text-accent"
            >
              Re-apply
            </button>
          </form>
        </div>
      )}

      {p.dev_status === "none" && (
        <form action={applyForDev} className="mt-8 flex flex-col gap-4">
          <div className="glass-card aurora-border rounded-xl p-4 text-xs text-text-muted">
            <div className="flex items-start gap-2">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
              <p>
                We verify every developer before granting access, so the people using
                NexApp can trust who&apos;s behind the apps they install.
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Tell us about yourself
            </label>
            <textarea
              name="note"
              required
              rows={5}
              placeholder="What do you build? Any apps, repos, or portfolio links worth mentioning?"
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent"
          >
            Apply for developer access
          </button>
        </form>
      )}
    </div>
  );
}
