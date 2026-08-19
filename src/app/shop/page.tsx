import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import ShopBrowser from "@/components/ShopBrowser";
import type { App, Category } from "@/lib/types";

// This page no longer reads cookies() or searchParams server-side —
// filtering happens client-side in ShopBrowser now — so it can be served
// from cache and revalidated in the background instead of hitting Supabase
// on every single visit.
export const revalidate = 60;

export default async function AppsPage() {
  const supabase = createPublicClient();

  const [{ data: categories }, { data: apps }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("apps")
      .select("*, categories(id, name, slug)")
      .eq("status", "published")
      .order("downloads_count", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-center font-display text-4xl font-extrabold sm:text-5xl">
        Shop Now <span className="aurora-text">&gt;</span>
      </h1>
      <p className="mt-2 text-center text-text-muted">
        Search the catalog or filter by category — results update as you type.
      </p>

      <Suspense>
        <ShopBrowser
          initialApps={(apps as App[]) ?? []}
          categories={(categories as Category[]) ?? []}
        />
      </Suspense>
    </div>
  );
}
