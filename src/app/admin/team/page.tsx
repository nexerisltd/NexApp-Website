import { UserPlus, Shield, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNexIdsByEmail } from "@/lib/nexauras";
import { promoteAdmin, revokeAdmin } from "@/app/admin/team/actions";
import FeedbackToast from "@/components/FeedbackToast";

type AdminRow = { id: string; email: string; full_name: string | null };

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: admins } = await supabase.rpc("list_admins");

  const nexIds = await getNexIdsByEmail(
    ((admins as AdminRow[] | null) ?? []).map((a) => a.email)
  );

  return (
    <div>
      <FeedbackToast
        saved={saved === "1"}
        error={error}
        successMessage="Admin list updated"
        redirectTo="/admin/team"
      />
      <h1 className="font-display text-2xl font-bold">Admins</h1>
      <p className="mt-1 text-sm text-text-muted">
        Add or remove admin access by email. The person must already have a
        NexApp account (they need to sign up first).
      </p>

      <form
        action={promoteAdmin}
        className="glass-card aurora-border mt-8 flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="someone@gmail.com"
          className="aurora-border glass-card min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-full neu-raised px-5 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
        >
          <UserPlus size={15} /> Add admin
        </button>
      </form>

      <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
        {admins && admins.length > 0 ? (
          (admins as AdminRow[]).map((admin) => (
            <div key={admin.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="glass-card flex h-9 w-9 items-center justify-center rounded-full text-accent">
                  <Shield size={14} />
                </span>
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {admin.full_name || admin.email}
                    {nexIds[admin.email] && (
                      <span className="glass-card aurora-border rounded-full px-2 py-0.5 font-mono text-[10px] font-normal text-accent">
                        {nexIds[admin.email]}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">{admin.email}</p>
                </div>
              </div>
              <form action={revokeAdmin}>
                <input type="hidden" name="email" value={admin.email} />
                <button
                  type="submit"
                  aria-label={`Remove admin access for ${admin.email}`}
                  className="glass-card flex h-9 w-9 items-center justify-center rounded-full text-danger transition-transform hover:scale-105"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-text-muted">No admins found.</p>
        )}
      </div>
    </div>
  );
}
