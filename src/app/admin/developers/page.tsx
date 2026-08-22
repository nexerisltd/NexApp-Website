import { Search, UserCheck, UserX, IdCard, Globe, GitBranch, Link as LinkIcon, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSignedDevDocUrl } from "@/lib/devDocSignedUrl";
import { approveDevVerification, rejectDevVerification } from "@/app/admin/developers/actions";
import FeedbackToast from "@/components/FeedbackToast";
import DevVerificationRealtimeWatcher from "@/components/DevVerificationRealtimeWatcher";
import type { DevVerification, Profile } from "@/lib/types";

export default async function AdminDevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; q?: string }>;
}) {
  const { saved, error, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("dev_verifications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (q?.trim()) {
    const term = q.trim();
    query = query.or(
      `request_number.ilike.%${term}%,full_legal_name.ilike.%${term}%,display_name.ilike.%${term}%`
    );
  }

  const { data: pending } = await query;

  const { data: verified } = await supabase
    .from("profiles")
    .select("*")
    .eq("dev_status", "verified")
    .order("display_name");

  const pendingList = (pending as DevVerification[] | null) ?? [];
  const docUrls = await Promise.all(
    pendingList.map(async (v) => ({
      id: v.id,
      govId: await getSignedDevDocUrl(supabase, v.gov_id_document_url),
      selfie: await getSignedDevDocUrl(supabase, v.selfie_url),
    }))
  );

  return (
    <div>
      <DevVerificationRealtimeWatcher />
      <FeedbackToast
        saved={saved === "1"}
        error={error}
        successMessage="Application updated"
        redirectTo="/admin/developers"
      />
      <h1 className="font-display text-2xl font-bold">Developer verification</h1>
      <p className="mt-1 text-sm text-text-muted">
        New requests appear here instantly. Compare the ID and selfie by hand before
        approving.
      </p>

      <form className="mt-6 flex items-center gap-2">
        <div className="aurora-border glass-card flex w-full max-w-sm items-center gap-2 rounded-full px-4 py-2.5">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by request ID or name…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-5">
        {pendingList.length > 0 ? (
          pendingList.map((v) => {
            const docs = docUrls.find((d) => d.id === v.id);
            return (
              <div key={v.id} className="glass-card aurora-border rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {v.display_name}{" "}
                      <span className="font-mono text-xs text-text-muted">
                        ({v.full_legal_name})
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-accent">{v.request_number}</p>
                  </div>
                  <span className="text-xs text-text-muted">
                    {v.country} · DOB {v.date_of_birth}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm">
                  <Phone size={13} className="text-text-muted" />
                  <span className="font-mono">{v.phone_number}</span>
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-[10px] font-mono uppercase text-text-muted">
                      {v.gov_id_type.replace("_", " ")}
                    </p>
                    {docs?.govId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={docs.govId}
                        alt="Government ID"
                        className="aurora-border h-28 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-xl bg-surface-2 text-xs text-text-muted">
                        <IdCard size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-mono uppercase text-text-muted">Selfie</p>
                    {docs?.selfie ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={docs.selfie}
                        alt="Selfie"
                        className="aurora-border h-28 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-xl bg-surface-2 text-xs text-text-muted">
                        <IdCard size={16} />
                      </div>
                    )}
                  </div>
                </div>

                {v.bio && <p className="mt-3 text-sm text-text-muted">{v.bio}</p>}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
                  {v.portfolio_url && (
                    <a href={v.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent underline">
                      <LinkIcon size={11} /> Portfolio
                    </a>
                  )}
                  {v.github_url && (
                    <a href={v.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent underline">
                      <GitBranch size={11} /> GitHub
                    </a>
                  )}
                  {v.dev_areas?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe size={11} /> {v.dev_areas.join(", ")}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={approveDevVerification} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={v.id} />
                    <label className="flex items-center gap-1.5 text-[11px] text-text-muted">
                      <input type="checkbox" required className="h-3.5 w-3.5 accent-success" />
                      I&apos;ve manually checked the ID, selfie, and phone number
                    </label>
                    <button
                      type="submit"
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-4 py-2 text-xs font-medium text-success"
                    >
                      <UserCheck size={13} /> Approve
                    </button>
                  </form>
                  <form action={rejectDevVerification} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={v.id} />
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
            );
          })
        ) : (
          <p className="py-10 text-center text-text-muted">
            {q ? "No matching requests." : "No pending applications."}
          </p>
        )}
      </div>

      <h2 className="mt-10 font-display text-sm font-semibold text-text-muted">
        Verified developers ({verified?.length ?? 0})
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {(verified as Profile[] | null)?.map((p) => (
          <span key={p.id} className="glass-card aurora-border rounded-full px-3 py-1.5 text-xs">
            {p.display_name || p.full_name || "Unnamed"}
            {p.country ? ` · ${p.country}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
