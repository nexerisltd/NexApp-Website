"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ScreenshotGallery({
  screenshots,
  appName,
}: {
  screenshots: string[];
  appName: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  if (screenshots.length === 0) return null;

  function scrollStrip(direction: 1 | -1) {
    stripRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  function close() {
    setOpenIndex(null);
  }
  function prev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + screenshots.length) % screenshots.length));
  }
  function next() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % screenshots.length));
  }

  return (
    <>
      <div className="relative mt-12">
        {screenshots.length > 1 && (
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
          {screenshots.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="aurora-border shrink-0 overflow-hidden rounded-xl bg-surface transition-transform hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
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

            {screenshots.length > 1 && (
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
              src={screenshots[openIndex]}
              alt={`${appName} screenshot ${openIndex + 1}`}
              className="aurora-border max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
