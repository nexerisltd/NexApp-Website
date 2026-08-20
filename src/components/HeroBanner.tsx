"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export type BillboardSlide = {
  id: string;
  badge: string | null;
  title: string;
  body: string | null;
  coverUrl: string | null;
  coverPosition: string;
  iconUrl: string | null;
  href: string;
  ctaLabel: string;
};

// Shown when the admin hasn't configured any billboards yet, so the
// homepage never looks empty out of the box.
const DEFAULT_SLIDES: BillboardSlide[] = [
  {
    id: "default-1",
    badge: "New Release",
    title: "Discover the Best\nApps for You",
    body: "Explore thousands of amazing apps, tools, and games. Find your next favorite app today.",
    coverUrl: null,
    coverPosition: "50% 50%",
    iconUrl: "/icon-512.png",
    href: "/shop",
    ctaLabel: "Explore Apps",
  },
  {
    id: "default-2",
    badge: "Community",
    title: "Built by developers,\nshared with everyone",
    body: "Every app in the store comes from someone who built it and wanted to share it. Yours could be next.",
    coverUrl: null,
    coverPosition: "50% 50%",
    iconUrl: "/icon-512.png",
    href: "/submit",
    ctaLabel: "Submit an app",
  },
  {
    id: "default-3",
    badge: "Always free",
    title: "Install it like\na native app",
    body: "NexApp works as a Progressive Web App — install it once and open it straight from your desktop or home screen.",
    coverUrl: null,
    coverPosition: "50% 50%",
    iconUrl: "/icon-512.png",
    href: "/shop",
    ctaLabel: "Get started",
  },
];

const SLIDE_MS = 7000;

export default function HeroBanner({ billboards }: { billboards?: BillboardSlide[] }) {
  const slides = billboards && billboards.length > 0 ? billboards : DEFAULT_SLIDES;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // If the slide set changes (e.g. billboards load in), keep the index valid.
  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[index] ?? slides[0];
  const titleLines = slide.title.split("\n");

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#1b1140] via-[#151233] to-[#0c1230] px-8 py-14 sm:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cover image background, when this slide features an app with one. */}
      <AnimatePresence>
        {slide.coverUrl && (
          <motion.div
            key={slide.coverUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.coverUrl}
              alt=""
              style={{ objectPosition: slide.coverPosition }}
              className="h-full w-full object-cover"
            />
            {/* Dark scrim so the title/body stay readable over any cover photo,
                regardless of the site's light/dark theme. */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a1f]/95 via-[#0c0a1f]/75 to-[#0c0a1f]/30" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-24 h-40 w-40 rounded-full bg-[#21c3e0]/20 blur-3xl" />

      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {slide.badge && (
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-accent">
                {slide.badge}
              </span>
            )}
            {/* Hero background is always dark (gradient or cover photo + scrim),
                so text here is forced to a fixed light color instead of the
                theme-dependent text-text token, which used to go unreadable
                (dark-on-dark) whenever the site was in light mode. */}
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {titleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>
            {slide.body && (
              <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                {slide.body}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={slide.href}
                className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.03]"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative hidden items-center justify-center lg:flex">
          <motion.div
            key={slide.iconUrl ?? "default-icon"}
            animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 scale-90 rounded-full bg-accent/30 blur-3xl" />
            <Image
              src={slide.iconUrl || "/icon-512.png"}
              alt=""
              width={260}
              height={260}
              priority
              className="relative rounded-3xl drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="relative mt-10 flex gap-1.5">
          {slides.map((_, i) => (
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
      )}
    </div>
  );
}
