import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppCard from "@/components/AppCard";
import AnimatedGrid from "@/components/AnimatedGrid";
import HeroSection from "@/components/HeroSection";
import GoodbyeModal from "@/components/GoodbyeModal";
import type { App } from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ goodbye?: string }>;
}) {
  const { goodbye } = await searchParams;
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("apps")
    .select("*, categories(id, name, slug)")
    .eq("status", "published")
    .order("downloads_count", { ascending: false })
    .limit(6);

  return (
    <div>
      <GoodbyeModal show={goodbye === "1"} />
      <HeroSection />

      {/* Featured apps */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Popular right now</h2>
          <Link href="/shop" className="text-sm text-text-muted hover:text-text">
            View all &rarr;
          </Link>
        </div>

        {apps && apps.length > 0 ? (
          <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(apps as App[]).map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </AnimatedGrid>
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
            No apps published yet — check back soon, or head to{" "}
            <Link href="/admin" className="underline underline-offset-4">
              the admin panel
            </Link>{" "}
            to publish the first one.
          </div>
        )}
      </section>
    </div>
  );
}
