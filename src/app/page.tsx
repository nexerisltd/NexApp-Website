import { Suspense } from "react";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import HeroBanner, { type BillboardSlide } from "@/components/HeroBanner";
import FeaturedAppCard from "@/components/FeaturedAppCard";
import TopCategoriesGrid from "@/components/TopCategoriesGrid";
import TopAppsList from "@/components/TopAppsList";
import GoodbyeModal from "@/components/GoodbyeModal";
import type { App, Billboard, Category } from "@/lib/types";

// The sidebar now reads cookies() on every request (for per-user
// personalization — unread count, dev/admin status), which makes the whole
// route tree dynamic. A `revalidate` directive here would conflict with
// that (ISR/static caching vs. per-request dynamic rendering) and is what
// caused the server-side exception — so this page is dynamic now too.

export default async function Home() {
  const supabase = createPublicClient();

  const [{ data: apps }, { data: categories }, { data: billboards }] = await Promise.all([
    supabase
      .from("apps")
      .select("*, categories(id, name, slug)")
      .eq("status", "published")
      .order("downloads_count", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("billboards")
      .select("*, apps(name, slug, icon_url, cover_url, cover_position)")
      .eq("active", true)
      .order("display_order", { ascending: true }),
  ]);

  const allApps = (apps as App[]) ?? [];

  const billboardSlides: BillboardSlide[] = ((billboards as Billboard[]) ?? [])
    .filter((b) => b.apps)
    .map((b) => ({
      id: b.id,
      badge: b.offer,
      title: b.title,
      body: null,
      coverUrl: b.apps!.cover_url,
      coverPosition: b.apps!.cover_position || "50% 50%",
      iconUrl: b.apps!.icon_url,
      href: `/shop/${b.apps!.slug}`,
      ctaLabel: "Learn more",
    }));
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

      <HeroBanner billboards={billboardSlides} />

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
