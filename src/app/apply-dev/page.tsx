import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Clock, XCircle, CheckCircle2, IdCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { applyForDev } from "@/app/apply-dev/actions";
import FeedbackToast from "@/components/FeedbackToast";
import DevStatusRealtimeWatcher from "@/components/DevStatusRealtimeWatcher";
import PrivateDocFileInput from "@/components/PrivateDocFileInput";
import { UploadTrackerProvider } from "@/lib/uploadTracker";
import SubmitButton from "@/components/SubmitButton";
import type { DevVerification, Profile } from "@/lib/types";

const DEV_AREAS: { value: string; label: string }[] = [
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "web", label: "Web" },
  { value: "desktop", label: "Desktop" },
  { value: "backend", label: "Backend" },
  { value: "game_dev", label: "Game Dev" },
  { value: "other", label: "Other" },
];

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

  const [{ data: profile }, { data: verification }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("dev_verifications").select("*").eq("profile_id", user.id).maybeSingle(),
  ]);
  const p = profile as Profile;
  const v = verification as DevVerification | null;

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <DevStatusRealtimeWatcher userId={user.id} />
      <FeedbackToast
        error={error}
        saved={saved === "1"}
        successMessage="Application submitted."
        redirectTo="/apply-dev"
      />
      <h1 className="font-display text-2xl font-bold">Developer verification</h1>
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
              Our review team is checking your details. This page updates itself the
              instant there&apos;s a decision — no need to refresh.
            </p>
            {v?.request_number && (
              <p className="mt-2 font-mono text-xs text-text-muted">
                Request ID: {v.request_number}
              </p>
            )}
          </div>
        </div>
      )}

      {p.dev_status === "rejected" && (
        <div className="glass-card mt-8 flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/5 p-5">
          <XCircle size={20} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="font-medium">Your application wasn&apos;t approved.</p>
            {p.dev_reject_reason && (
              <p className="mt-1 text-sm text-text-muted">
                Reason from the review team: &quot;{p.dev_reject_reason}&quot;
              </p>
            )}
            <p className="mt-1 text-xs text-text-muted">
              Update your details below and re-apply — your request keeps the same ID.
            </p>
          </div>
        </div>
      )}

      {(p.dev_status === "none" || p.dev_status === "rejected") && (
        <UploadTrackerProvider>
          <form action={applyForDev} className="mt-8 flex flex-col gap-6">
            <div className="glass-card aurora-border rounded-xl p-4 text-xs text-text-muted">
              <div className="flex items-start gap-2">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                <p>
                  We verify every developer&apos;s identity before granting access, so
                  the people using NexApp can trust who&apos;s behind the apps they
                  install. Your legal name, ID, phone, and documents are never shown
                  publicly — only your display name and country are.
                </p>
              </div>
            </div>

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-sm font-semibold">Account information</h2>
              <input
                name="full_legal_name"
                required
                placeholder="Full legal name (as on your ID)"
                defaultValue={v?.full_legal_name ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <input
                name="display_name"
                required
                placeholder="Developer / display name (shown publicly)"
                defaultValue={v?.display_name ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="country"
                  required
                  placeholder="Country"
                  defaultValue={v?.country ?? ""}
                  className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
                />
                <input
                  type="date"
                  name="date_of_birth"
                  required
                  defaultValue={v?.date_of_birth ?? ""}
                  className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <input
                name="phone_number"
                type="tel"
                required
                placeholder="Phone number"
                defaultValue={v?.phone_number ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <p className="text-[11px] text-text-muted">
                No OTP text right now — our review team checks this by hand alongside
                your ID during manual review.
              </p>
              <p className="text-[11px] text-text-muted">
                Signed in as {user.email} — used as your verified email automatically.
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-sm font-semibold">Identity verification</h2>
              <select
                name="gov_id_type"
                required
                defaultValue={v?.gov_id_type ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              >
                <option value="" disabled>
                  Government ID type
                </option>
                <option value="nid">National ID (NID)</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
              </select>
              <PrivateDocFileInput
                fieldName="gov_id_document_path"
                label="Government-issued ID (photo of the document)"
                folder="gov_id"
              />
              <PrivateDocFileInput
                fieldName="selfie_path"
                label="Selfie (for our team to match against your ID)"
                folder="selfie"
              />
              <div className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-text-muted">
                <IdCard size={16} className="mt-0.5 shrink-0 text-accent" />
                <p>
                  A member of our review team compares your ID and selfie by hand before
                  approving — this isn&apos;t an automated check.
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-sm font-semibold">Developer information</h2>
              <textarea
                name="bio"
                rows={3}
                placeholder="Developer bio"
                defaultValue={v?.bio ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <input
                name="portfolio_url"
                type="url"
                placeholder="Portfolio website (optional)"
                defaultValue={v?.portfolio_url ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <input
                name="github_url"
                type="url"
                placeholder="GitHub / GitLab (optional)"
                defaultValue={v?.github_url ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <textarea
                name="previous_projects"
                rows={2}
                placeholder="Previous apps / projects (optional)"
                defaultValue={v?.previous_projects ?? ""}
                className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
              />
              <div>
                <p className="mb-2 text-xs font-mono text-text-muted">
                  Areas of development
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEV_AREAS.map((area) => (
                    <label
                      key={area.value}
                      className="glass-card aurora-border flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                    >
                      <input
                        type="checkbox"
                        name="dev_areas"
                        value={area.value}
                        defaultChecked={v?.dev_areas?.includes(area.value as never)}
                        className="h-3.5 w-3.5 accent-accent"
                      />
                      {area.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-2.5">
              <h2 className="font-display text-sm font-semibold">
                Legal &amp; accountability
              </h2>
              {[
                ["agreement_accepted", "I accept the Developer Agreement."],
                ["ownership_declaration", "I declare I own or have the rights to the apps I submit."],
                ["ip_responsibility_declaration", "I take responsibility for any copyright/IP claims on my submissions."],
                ["content_policy_accepted", "I accept NexApp's content & malware policy."],
                ["privacy_policy_accepted", "I accept the Privacy Policy requirements."],
                ["false_info_agreement", "I understand providing false information may lead to account suspension."],
              ].map(([name, label]) => (
                <label key={name} className="flex items-start gap-2.5 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    name={name}
                    required
                    defaultChecked={
                      v ? (v[name as keyof DevVerification] as boolean) : false
                    }
                    className="mt-0.5 h-4 w-4 accent-accent"
                  />
                  {label}
                </label>
              ))}
            </section>

            <SubmitButton pendingLabel="Submitting…">
              {p.dev_status === "rejected" ? "Re-submit for review" : "Submit for verification"}
            </SubmitButton>
          </form>
        </UploadTrackerProvider>
      )}
    </div>
  );
}
