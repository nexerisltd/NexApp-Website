"use client";

import { motion } from "framer-motion";
import { Download, Star } from "lucide-react";

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="aurora-blob left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-strong aurora-border absolute inset-6 rounded-3xl p-6"
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-aurora-violet/70" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            "var(--aurora-violet)",
            "var(--aurora-magenta)",
            "var(--aurora-teal)",
            "var(--aurora-teal)",
            "var(--aurora-violet)",
            "var(--aurora-magenta)",
          ].map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
              className="aspect-square rounded-2xl"
              style={{ background: `color-mix(in srgb, ${color} 65%, transparent)` }}
            />
          ))}
        </div>

        <div className="mt-6 h-2.5 w-2/3 rounded-full bg-surface-2" />
        <div className="mt-2 h-2.5 w-1/2 rounded-full bg-surface-2" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.5, delay: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        className="glass-strong aurora-border absolute -left-2 top-4 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-lg sm:-left-6"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success">
          <Download size={14} />
        </span>
        <div className="text-xs">
          <p className="font-semibold">Download complete</p>
          <p className="text-text-muted">120 MB · Windows</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { duration: 0.5, delay: 0.7 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        className="glass-strong aurora-border absolute -right-2 bottom-6 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-lg sm:-right-6"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aurora-violet/15 text-aurora-violet">
          <Star size={14} />
        </span>
        <div className="text-xs">
          <p className="font-semibold">4.9 rating</p>
          <p className="text-text-muted">2,300+ downloads</p>
        </div>
      </motion.div>
    </div>
  );
}
