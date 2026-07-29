import Link from "next/link";
import { GitBranch, LayoutGrid, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Source } from "@/lib/types";

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

  const query = supabase
    .from("sources")
    .select("*, apps(name, slug, icon_url)")
    .order("created_at", { ascending: false });

  const { data: sources } = await query;

  const filtered = q
    ? (sources as Source[] | null)?.filter((s) =>
        s.apps?.name.toLowerCase().includes(q.toLowerCase())
      )
    : (sources as Source[] | null);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-center font-display text-5xl font-extrabold">Source</h1>

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
        {filtered && filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((source) => (
              <div
                key={source.id}
                className="glass-card aurora-border flex items-center gap-4 rounded-2xl p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                  {source.apps?.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={source.apps.icon_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LayoutGrid size={20} className="text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/shop/${source.apps?.slug}`}
                    className="font-display font-semibold hover:underline"
                  >
                    {source.apps?.name}
                  </Link>
                  <p className="truncate text-xs text-text-muted">{source.github_url}</p>
                </div>
                <a
                  href={source.github_url}
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
            <p className="font-display text-lg font-semibold">No Source post yet.</p>
            {isAdmin && (
              <div className="mt-4 rounded-xl bg-surface-2 p-4 text-left text-sm text-text-muted">
                <p>
                  Click on <strong className="text-text">&quot;Admin&quot;</strong> in the
                  Navbar, click on <strong className="text-text">&quot;Source&quot;</strong>,
                  click on <strong className="text-text">&quot;Add New Source&quot;</strong>,
                  select your app from the live app list or search via app ID, then put
                  your GitHub repository link there and press Save.
                </p>
                <p className="mt-2 text-xs italic">
                  !! Your source link will be shown on that app&apos;s page !!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
