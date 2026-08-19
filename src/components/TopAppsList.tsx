import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Star } from "lucide-react";
import type { App } from "@/lib/types";

export default function TopAppsList({ apps }: { apps: App[] }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
      {apps.map((app, i) => (
        <Link
          key={app.id}
          href={`/shop/${app.slug}`}
          className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
        >
          <span className="w-4 shrink-0 font-mono text-sm font-bold text-text-muted">
            {i + 1}
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-text-muted">
            {app.icon_url ? (
              <Image
                src={app.icon_url}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <LayoutGrid size={16} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{app.name}</span>
            <span className="block text-xs text-text-muted">
              {app.categories?.name ?? "App"}
            </span>
          </span>
          {app.rating_count > 0 && (
            <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-text-muted">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {app.rating_avg.toFixed(1)}
            </span>
          )}
          <span className="shrink-0 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-bold">
            Get
          </span>
        </Link>
      ))}
    </div>
  );
}
