"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Download, LayoutGrid } from "lucide-react";
import type { App } from "@/lib/types";

export default function AppCard({ app }: { app: App }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link
        href={`/shop/${app.slug}`}
        className="group glass-card aurora-border aurora-glow flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center"
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-text-muted overflow-hidden">
          {app.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.icon_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <LayoutGrid size={28} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold aurora-text">{app.name}</p>
          {app.tagline && (
            <p className="mt-1 line-clamp-2 text-sm text-text-muted">{app.tagline}</p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-3 pt-2 font-mono text-xs text-text-muted">
          <span>v{app.version}</span>
          <span className="flex items-center gap-1">
            <Download size={12} /> {app.downloads_count.toLocaleString()}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
