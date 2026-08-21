import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNexIdsByEmail } from "@/lib/nexauras";
import type { App } from "@/lib/types";

type AdminRow = { id: string; email: string; full_name: string | null };

export default async function DeveloperProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, dev_status, profile_headline, profile_bio")
    .eq("id", id)
    .maybeSingle();

  // Only admins and verified developers have a public profile — anyone
  // else's profile page 404s rather than exposing an empty/half-built page.
  if (!profile || (profile.role !== "admin" && profile.dev_status !== "verified")) {
    notFound();
  }

  let nexId: string | null = null;
  if (profile.role === "admin") {
    const { data: admins } = await supabase.rpc("list_admins");
    const match = ((admins as AdminRow[] | null) ?? []).find((a) => a.id === profile.id);
    if (match) {
      const nexIds = await getNexIdsByEmail([match.email]);
      nexId = nexIds[match.email] ?? null;
    }
  }

  const { data: apps } = await supabase
    .from("apps")
    .select("id, name, slug, icon_url, tagline")
    .eq("created_by", profile.id)
    .eq("status", "published")
    .order("downloads_count", { ascending: false });

  const name = profile.full_name || "Unnamed";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-6 py-14">
      <div className="neu-raised rounded-3xl p-8 text-center">
        <span className="neu-pressed mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <div className="mt-4 flex items-center justify-center gap-2">
          <h1 className="font-display text-xl font-bold">{name}</h1>
          {profile.role === "admin" && (
            <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              <ShieldCheck size={11} /> Admin
            </span>
          )}
          {profile.dev_status === "verified" && profile.role !== "admin" && (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              <BadgeCheck size={11} /> Verified Developer
            </span>
          )}
        </div>
        {nexId && (
          <p className="mt-2 font-mono text-xs text-text-muted">Nex ID: {nexId}</p>
        )}
        {profile.profile_headline && (
          <p className="mt-2 text-sm text-text-muted">{profile.profile_headline}</p>
        )}
        {profile.profile_bio && (
          <p className="mt-4 whitespace-pre-wrap text-left text-sm text-text-muted">
            {profile.profile_bio}
          </p>
        )}
      </div>

      {apps && apps.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-wide text-text-muted">
            Published apps
          </p>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {(apps as App[]).map((app) => (
              <Link
                key={app.id}
                href={`/shop/${app.slug}`}
                className="flex items-center gap-3 py-3 hover:opacity-80"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                  {app.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <LayoutGrid size={16} className="text-text-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{app.name}</p>
                  {app.tagline && (
                    <p className="truncate text-xs text-text-muted">{app.tagline}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
