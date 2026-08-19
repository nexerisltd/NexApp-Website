import { Suspense } from "react";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import HeroBanner from "@/components/HeroBanner";
import FeaturedAppCard from "@/components/FeaturedAppCard";
import TopCategoriesGrid from "@/components/TopCategoriesGrid";
import TopAppsList from "@/components/TopAppsList";
import GoodbyeModal from "@/components/GoodbyeModal";
import type { App, Category } from "@/lib/types";

// No cookies()/searchParams are read server-side on this page, so Next.js
// can serve it from cache and only revalidate it in the background every
// 60s instead of re-rendering (and re-querying Supabase) on every visit.
export const revalidate = 60;

export default async function Home() {
  const supabase = createPublicClient();

  const [{ data: apps }, { data: categories }] = await Promise.all([
    supabase
      .from("apps")
      .select("*, categories(id, name, slug)")
      .eq("status", "published")
      .order("downloads_count", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const allApps = (apps as App[]) ?? [];
  const featured = allApps.slice(0, 4);
  const topApps = allApps.slice(0, 3);

  const categoryCounts = new Map<string, number>();
  for (const app of allApps) {
    if (app.categories?.id) {
      categoryCounts.set(app.categories.id, (categoryCounts.get(app.categories.id) ?? 0) + 1);
    }
  }
  const categoriesWithCounts = ((categories as Category[]) ?? [])
    .map((c) => ({ ...c, count: categoryCounts.get(c.id) ?? 0 }))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Suspense fallback={null}>
        <GoodbyeModal />
      </Suspense>

      <HeroBanner />

      <section id="featured" className="mb-12 mt-14 scroll-mt-24">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Featured Apps</h2>
          <Link href="/shop" className="text-sm text-text-muted hover:text-text">
            View All &rarr;
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((app, i) => (
              <FeaturedAppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
            No apps published yet — check back soon, or head to{" "}
            <Link href="/admin" className="underline underline-offset-4">
              the admin panel
            </Link>{" "}
            to publish the first one.
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {categoriesWithCounts.length > 0 && (
          <div>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-xl font-bold">Top Categories</h2>
              <Link href="/shop" className="text-sm text-text-muted hover:text-text">
                View All &rarr;
              </Link>
            </div>
            <TopCategoriesGrid categories={categoriesWithCounts} />
          </div>
        )}

        {topApps.length > 0 && (
          <div>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-xl font-bold">Top Apps</h2>
              <Link href="/shop" className="text-sm text-text-muted hover:text-text">
                View All &rarr;
              </Link>
            </div>
            <TopAppsList apps={topApps} />
          </div>
        )}
      </section>
    </div>
  );
}
