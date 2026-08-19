"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, LayoutGrid, Star } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import type { App } from "@/lib/types";

export default function AppCard({ app }: { app: App }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative h-full"
    >
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton appId={app.id} variant="icon" />
      </div>
      <Link
        href={`/shop/${app.slug}`}
        className="group glass-card aurora-border aurora-glow flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center"
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-text-muted overflow-hidden">
          {app.icon_url ? (
            <Image
              src={app.icon_url}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
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
          {app.rating_count > 0 && (
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-accent text-accent" />
              {app.rating_avg.toFixed(1)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
