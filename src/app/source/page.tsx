import Link from "next/link";
import { GitBranch, LayoutGrid, Search, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { App } from "@/lib/types";

export default async function SourcePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("is_admin", { uid: user.id });
    isAdmin = !!data;
  }

  // source_public gates what non-admins see here; admins reviewing the
  // page also get to see repos the developer chose to keep review-only.
  let query = supabase
    .from("apps")
    .select("id, name, slug, icon_url, github_url, source_public, status")
    .not("github_url", "is", null)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (!isAdmin) query = query.eq("source_public", true);

  const { data: apps } = await query;
  const list = (apps as App[] | null) ?? [];

  const filtered = q
    ? list.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
    : list;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-center font-display text-5xl font-extrabold">Source</h1>
      <p className="mt-3 text-center text-sm text-text-muted">
        Apps on NexApp whose developers chose to make their source public.
      </p>

      <form className="mt-10 flex items-center gap-2">
        <div className="aurora-border glass-card flex w-full items-center gap-2 rounded-full px-4 py-2.5">
          <Search size={14} className="text-text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </form>

      <div className="mt-10">
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="glass-card aurora-border flex items-center gap-4 rounded-2xl p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                  {app.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <LayoutGrid size={20} className="text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/shop/${app.slug}`}
                      className="font-display font-semibold hover:underline"
                    >
                      {app.name}
                    </Link>
                    {isAdmin && !app.source_public && (
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-text-muted">
                        Hidden from public
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-text-muted">{app.github_url}</p>
                </div>
                <a
                  href={app.github_url!}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-strong aurora-border flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-transform hover:scale-[1.03]"
                >
                  <GitBranch size={13} /> View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-display text-lg font-semibold">No public source yet.</p>
            {isAdmin ? (
              <div className="mt-4 rounded-xl bg-surface-2 p-4 text-left text-sm text-text-muted">
                <p>
                  Open <strong className="text-text">Admin → Apps</strong>, edit an app,
                  and fill in its <strong className="text-text">Source code</strong>{" "}
                  field with a GitHub link — make sure{" "}
                  <strong className="text-text">&quot;Public your source?&quot;</strong>{" "}
                  is checked so it shows up here.
                </p>
              </div>
            ) : (
              <div className="mx-auto mt-4 flex max-w-sm items-start gap-2 rounded-xl bg-surface-2 p-4 text-left text-xs text-text-muted">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-accent" />
                <p>
                  Every app submitted to NexApp includes a source repo for our review
                  team — developers can choose to also show it here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
