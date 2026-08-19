import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Star } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import type { App } from "@/lib/types";

const ICON_GRADIENTS = [
  "linear-gradient(135deg, #7c3aed, #4d76ff)",
  "linear-gradient(135deg, #e6437a, #f59e0b)",
  "linear-gradient(135deg, #2b8fe0, #12b8a6)",
  "linear-gradient(135deg, #12b8a6, #4ade95)",
];

export default function FeaturedAppCard({ app, index }: { app: App; index: number }) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-surface p-5 transition-transform hover:-translate-y-1">
      <div className="absolute right-4 top-4">
        <FavoriteButton appId={app.id} variant="icon" />
      </div>

      <Link href={`/shop/${app.slug}`} className="flex flex-1 flex-col">
        <div
          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-white"
          style={{ background: app.icon_url ? undefined : ICON_GRADIENTS[index % 4] }}
        >
          {app.icon_url ? (
            <Image src={app.icon_url} alt="" width={56} height={56} className="h-full w-full object-cover" />
          ) : (
            <LayoutGrid size={22} />
          )}
        </div>

        <p className="mt-3 font-display text-base font-bold">{app.name}</p>
        <p className="text-xs text-text-muted">{app.categories?.name ?? "App"}</p>

        <p className="mt-3 flex-1 text-xs leading-relaxed text-text-muted">
          {app.tagline ?? "No description yet."}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-xs text-text-muted">
            {app.rating_count > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {app.rating_avg.toFixed(1)}
              </span>
            )}
            <span>{app.downloads_count.toLocaleString()}</span>
          </div>
          <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white">
            Get
          </span>
        </div>
      </Link>
    </div>
  );
}
