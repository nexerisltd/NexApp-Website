"use client";

import { motion } from "framer-motion";
import { Download, ShieldCheck, Sparkles } from "lucide-react";

const points = [
  { icon: Sparkles, text: "Discover apps across every category" },
  { icon: Download, text: "Track everything you've downloaded" },
  { icon: ShieldCheck, text: "One account, web today — mobile & desktop next" },
];

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-73px)] overflow-hidden">
      <div className="aurora-blob left-[-15%] top-[-10%] h-[440px] w-[440px]" />
      <div className="aurora-blob right-[-20%] bottom-[-15%] h-[380px] w-[380px]" />

      {/* Branding panel — desktop only */}
      <div className="relative z-10 hidden flex-1 flex-col justify-center px-16 lg:flex">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            A NexAuras product
          </p>
          <h2 className="mt-4 max-w-md font-display text-4xl font-bold leading-[1.15]">
            Every app,
            <br />
            <span className="aurora-text">one place.</span>
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {points.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-text-muted"
              >
                <span className="glass-card aurora-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Icon size={16} />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-card aurora-border w-full max-w-sm rounded-3xl p-8"
        >
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
