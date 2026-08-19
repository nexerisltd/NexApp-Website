"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AppCard from "@/components/AppCard";
import AnimatedGrid from "@/components/AnimatedGrid";
import type { App, Category } from "@/lib/types";

export default function ShopBrowser({
  initialApps,
  categories,
}: {
  // Full published-apps list from a cacheable, cookie-free fetch — may be
  // unfiltered even when the URL has ?q=/?category=, since filtering now
  // happens client-side (see the mount-time effect below) instead of on
  // the server, so this page can stay ISR-cached rather than re-querying
  // Supabase on every single visit.
  initialApps: App[];
  categories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "");
  const [apps, setApps] = useState<App[]>(initialApps);
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  // "Top Charts" from the sidebar just uses the default downloads-desc
  // order already applied server-side; "New Releases" re-sorts what's
  // already loaded rather than firing another query.
  const sort = searchParams.get("sort");
  const displayApps =
    sort === "new"
      ? [...apps].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : apps;

  const supabaseRef = useRef(createClient());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  // Only skip the client-side fetch on first render when there's nothing to
  // filter by — otherwise (a shared ?q=/?category= link) we still need to
  // filter the full list client-side, since the server no longer does it.
  const isFirstRun = useRef(true);

  // Favorited state is resolved by the global FavoritesProvider (see
  // lib/favorites-context.tsx) — no per-page fetch needed here anymore.

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (!(query ?? "").trim() && !category) return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const thisRequestId = ++requestIdRef.current;
      setIsSearching(true);

      let dbQuery = supabaseRef.current
        .from("apps")
        .select("*, categories(id, name, slug)")
        .eq("status", "published")
        .order("downloads_count", { ascending: false });

      const trimmed = (query ?? "").trim();
      if (trimmed) {
        dbQuery = dbQuery.or(`name.ilike.%${trimmed}%,app_code.ilike.%${trimmed}%`);
      }
      if (category) {
        const cat = categories.find((c) => c.slug === category);
        if (cat) dbQuery = dbQuery.eq("category_id", cat.id);
      }

      const { data } = await dbQuery;

      // Ignore stale responses if a newer keystroke already fired a request.
      if (thisRequestId !== requestIdRef.current) return;

      setApps((data as App[]) ?? []);
      setIsSearching(false);

      // Keep the URL shareable/bookmarkable without a full navigation.
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      if (category) params.set("category", category);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
      });
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps..."
            className="glass-card aurora-border w-full rounded-full py-2.5 pl-9 pr-9 text-sm outline-none"
          />
          {isSearching && (
            <Loader2
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-text-muted"
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full px-4 py-1.5 text-xs font-mono transition-colors ${
            !category ? "neu-pressed text-accent" : "glass-card text-text-muted"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`rounded-full px-4 py-1.5 text-xs font-mono transition-colors ${
              category === c.slug ? "neu-pressed text-accent" : "glass-card text-text-muted"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {displayApps.length > 0 ? (
          <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </AnimatedGrid>
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
            No apps match your search.
          </div>
        )}
      </div>
    </>
  );
}
