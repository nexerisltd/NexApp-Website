import { redirect } from "next/navigation";
import Link from "next/link";
import { PackageCheck, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MarkUpdatesSeen from "@/components/MarkUpdatesSeen";
import type { AppUpdate } from "@/lib/types";

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function UpdatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: updates } = await supabase.rpc("get_my_app_updates");
  const list = (updates as AppUpdate[] | null) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <MarkUpdatesSeen />
      <h1 className="font-display text-2xl font-bold">Updates</h1>
      <p className="mt-1 text-sm text-text-muted">
        New versions of apps you&apos;ve favorited or downloaded.
      </p>

      <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
        {list.length > 0 ? (
          list.map((u) => (
            <Link
              key={u.app_id}
              href={`/shop/${u.slug}`}
              className="flex items-center gap-3 py-4 hover:opacity-80"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                {u.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.icon_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <LayoutGrid size={18} className="text-text-muted" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-text-muted">
                  Updated to v{u.version} &middot; {relativeTime(u.version_updated_at)}
                </p>
              </div>
              <PackageCheck size={16} className="shrink-0 text-accent" />
            </Link>
          ))
        ) : (
          <div className="glass-card my-6 rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
            <p className="font-display text-lg font-semibold text-text">
              No new updates.
            </p>
            <p className="mt-2 text-sm">
              Favorite or download some apps and you&apos;ll see their new versions
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
