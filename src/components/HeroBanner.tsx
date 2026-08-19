"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  {
    badge: "New Release",
    title: ["Discover the Best", "Apps for You"],
    body: "Explore thousands of amazing apps, tools, and games. Find your next favorite app today.",
    primaryHref: "/shop",
    primaryLabel: "Explore Apps",
    secondaryHref: "#featured",
    secondaryLabel: "Learn More",
  },
  {
    badge: "Community",
    title: ["Built by developers,", "shared with everyone"],
    body: "Every app in the store comes from someone who built it and wanted to share it. Yours could be next.",
    primaryHref: "/submit",
    primaryLabel: "Submit an app",
    secondaryHref: "/shop",
    secondaryLabel: "Browse apps",
  },
  {
    badge: "Always free",
    title: ["Install it like", "a native app"],
    body: "NexApp works as a Progressive Web App — install it once and open it straight from your desktop or home screen.",
    primaryHref: "/shop",
    primaryLabel: "Get started",
    secondaryHref: "#featured",
    secondaryLabel: "See what's new",
  },
];

const SLIDE_MS = 7000;

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#1b1140] via-[#151233] to-[#0c1230] px-8 py-14 sm:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-24 h-40 w-40 rounded-full bg-[#21c3e0]/20 blur-3xl" />

      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-accent">
              {slide.badge}
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              {slide.title[0]}
              <br />
              {slide.title[1]}
            </h1>
            <p className="mt-4 max-w-md text-sm text-text-muted sm:text-base">{slide.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={slide.primaryHref}
                className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.03]"
              >
                {slide.primaryLabel}
              </Link>
              <Link
                href={slide.secondaryHref}
                className="rounded-xl border border-border bg-white/5 px-6 py-3 text-sm font-bold text-text transition-transform hover:scale-[1.03] hover:bg-white/10"
              >
                {slide.secondaryLabel}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative hidden items-center justify-center lg:flex">
          <motion.div
            animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 scale-90 rounded-full bg-accent/30 blur-3xl" />
            <Image
              src="/icon-512.png"
              alt="NexApp"
              width={260}
              height={260}
              priority
              className="relative drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="relative mt-10 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
