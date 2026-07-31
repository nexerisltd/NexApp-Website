import { createClient } from "@/lib/supabase/server";
import ShopBrowser from "@/components/ShopBrowser";
import type { App, Category } from "@/lib/types";

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("apps")
    .select("*, categories(id, name, slug)")
    .eq("status", "published")
    .order("downloads_count", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,app_code.ilike.%${q}%`);
  }
  if (category) {
    const cat = (categories as Category[] | null)?.find((c) => c.slug === category);
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data: apps } = await query;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-center font-display text-4xl font-extrabold sm:text-5xl">
        Shop Now <span className="aurora-text">&gt;</span>
      </h1>
      <p className="mt-2 text-center text-text-muted">
        Search the catalog or filter by category — results update as you type.
      </p>

      <ShopBrowser
        initialApps={(apps as App[]) ?? []}
        initialQuery={q ?? ""}
        initialCategory={category ?? ""}
        categories={(categories as Category[]) ?? []}
      />
    </div>
  );
}
