"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Globe, X } from "lucide-react";
import { usePlatformPreference } from "@/lib/platformPreference";
import type { PlatformGroup, Screenshot } from "@/lib/types";

const GROUP_META: Record<PlatformGroup, { label: string; icon: typeof Monitor }> = {
  desktop: { label: "Desktop", icon: Monitor },
  mobile: { label: "Mobile", icon: Smartphone },
  web: { label: "Web", icon: Globe },
  other: { label: "Other", icon: Globe },
};

const GROUP_ORDER: PlatformGroup[] = ["desktop", "mobile", "web", "other"];

export default function ScreenshotGallery({
  screenshots,
  defaultPlatform,
  appName,
}: {
  screenshots: Screenshot[];
  defaultPlatform: PlatformGroup;
  appName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [manualGroup, setManualGroup] = useState<PlatformGroup | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [storedPreference, setStoredPreference] = usePlatformPreference();

  const availableGroups = useMemo(
    () => GROUP_ORDER.filter((g) => screenshots.some((s) => s.group === g)),
    [screenshots]
  );

  // Precedence: a switch made on this page right now > the visitor's saved
  // site-wide preference > the platform the admin set as default for this
  // app > whichever platform actually has screenshots.
  const wanted = manualGroup ?? storedPreference ?? defaultPlatform;
  const activeGroup = availableGroups.includes(wanted) ? wanted : availableGroups[0];

  const visible = useMemo(
    () => screenshots.filter((s) => s.group === activeGroup),
    [screenshots, activeGroup]
  );

  function selectGroup(group: PlatformGroup) {
    setManualGroup(group);
    setStoredPreference(group);
    setOpenIndex(null);
  }

  if (screenshots.length === 0) return null;

  function scrollStrip(direction: 1 | -1) {
    stripRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  function close() {
    setOpenIndex(null);
  }
  function prev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + visible.length) % visible.length));
  }
  function next() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % visible.length));
  }

  return (
    <>
      {availableGroups.length > 1 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-mono text-text-muted">Showing:</span>
          {availableGroups.map((group) => {
            const meta = GROUP_META[group];
            const Icon = meta.icon;
            const active = group === activeGroup;
            return (
              <button
                key={group}
                type="button"
                onClick={() => selectGroup(group)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active ? "neu-pressed text-accent" : "glass-card text-text-muted"
                }`}
              >
                <Icon size={12} /> {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative mt-6">
        {visible.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center">
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Scroll screenshots left"
                className="glass-strong aurora-border pointer-events-auto -ml-4 flex h-9 w-9 items-center justify-center rounded-full"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center">
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Scroll screenshots right"
                className="glass-strong aurora-border pointer-events-auto -mr-4 flex h-9 w-9 items-center justify-center rounded-full"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        <div ref={stripRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2">
          {visible.map((shot, i) => (
            <button
              key={shot.url + i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="aurora-border shrink-0 overflow-hidden rounded-xl bg-surface transition-transform hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.url}
                alt={`${appName} screenshot ${i + 1}`}
                className="h-64 w-auto object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="glass-strong absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full"
            >
              <X size={18} />
            </button>

            {visible.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous screenshot"
                  className="glass-strong absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full sm:left-8"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next screenshot"
                  className="glass-strong absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full sm:right-8"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            <motion.img
              key={openIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              src={visible[openIndex]?.url}
              alt={`${appName} screenshot ${openIndex + 1}`}
              className="aurora-border max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
