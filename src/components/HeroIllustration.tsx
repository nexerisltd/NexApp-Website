"use client";

import { motion } from "framer-motion";
import { Download, Star } from "lucide-react";

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="neu-raised absolute inset-6 rounded-3xl p-6"
      >
        <div className="flex items-center gap-1.5">
          <span className="neu-pressed h-2.5 w-2.5 rounded-full" />
          <span className="neu-pressed h-2.5 w-2.5 rounded-full" />
          <span className="neu-pressed h-2.5 w-2.5 rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
              className="neu-pressed aspect-square rounded-2xl"
            />
          ))}
        </div>

        <div className="neu-pressed mt-6 h-2.5 w-2/3 rounded-full" />
        <div className="neu-pressed mt-2 h-2.5 w-1/2 rounded-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.5, delay: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        className="neu-raised absolute -left-2 top-4 flex items-center gap-2 rounded-2xl px-4 py-3 sm:-left-6"
      >
        <span className="neu-pressed flex h-8 w-8 items-center justify-center rounded-full text-accent">
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
        className="neu-raised absolute -right-2 bottom-6 flex items-center gap-2 rounded-2xl px-4 py-3 sm:-right-6"
      >
        <span className="neu-pressed flex h-8 w-8 items-center justify-center rounded-full text-accent">
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
