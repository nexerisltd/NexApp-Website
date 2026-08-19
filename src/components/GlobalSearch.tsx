"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Loader2, Search, X } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import type { App } from "@/lib/types";

export default function GlobalSearch({ variant = "icon" }: { variant?: "icon" | "pill" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Cmd/Ctrl+K opens the palette from anywhere.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      // Wait a tick for the mount animation before focusing.
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const thisRequestId = ++requestIdRef.current;
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("apps")
        .select("id, name, slug, tagline, icon_url, downloads_count")
        .eq("status", "published")
        .or(`name.ilike.%${trimmed}%,app_code.ilike.%${trimmed}%`)
        .order("downloads_count", { ascending: false })
        .limit(6);

      if (thisRequestId !== requestIdRef.current) return;
      setResults((data as App[]) ?? []);
      setLoading(false);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToApp(slug: string) {
    setOpen(false);
    router.push(`/shop/${slug}`);
  }

  function seeAllResults() {
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      {variant === "pill" ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full max-w-md items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-left text-sm text-text-muted transition-colors hover:text-text"
        >
          <Search size={15} />
          <span className="flex-1">Search apps, games, tools...</span>
          <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl K
          </kbd>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search apps"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text"
        >
          <Search size={17} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card aurora-border w-full max-w-lg overflow-hidden rounded-2xl"
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search size={16} className="text-text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") seeAllResults();
                  }}
                  placeholder="Search apps..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
                />
                {loading && <Loader2 size={14} className="animate-spin text-text-muted" />}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="text-text-muted hover:text-text"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {results.length > 0 ? (
                  <>
                    {results.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => goToApp(app.slug)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-2"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-text-muted">
                          {app.icon_url ? (
                            <Image
                              src={app.icon_url}
                              alt=""
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <LayoutGrid size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{app.name}</p>
                          {app.tagline && (
                            <p className="truncate text-xs text-text-muted">{app.tagline}</p>
                          )}
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={seeAllResults}
                      className="w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-accent hover:bg-surface-2"
                    >
                      See all results for &ldquo;{query.trim()}&rdquo;
                    </button>
                  </>
                ) : query.trim() && !loading ? (
                  <p className="px-4 py-8 text-center text-sm text-text-muted">
                    No apps match &ldquo;{query.trim()}&rdquo;
                  </p>
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-text-muted">
                    Start typing to search the catalog
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
