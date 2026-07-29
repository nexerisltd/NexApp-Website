import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppCard from "@/components/AppCard";
import AnimatedGrid from "@/components/AnimatedGrid";
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
    query = query.ilike("name", `%${q}%`);
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
        Search the catalog or filter by category.
      </p>

      <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search apps..."
          className="glass-card aurora-border w-full rounded-full px-5 py-2.5 text-sm outline-none sm:max-w-xs"
        />
        {category && <input type="hidden" name="category" value={category} />}
        <button
          type="submit"
          className="rounded-full neu-raised px-5 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
        >
          Search
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full px-4 py-1.5 text-xs font-mono transition-colors ${
            !category ? "neu-pressed text-accent" : "glass-card text-text-muted"
          }`}
        >
          All
        </Link>
        {(categories as Category[] | null)?.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-xs font-mono transition-colors ${
              category === c.slug ? "neu-pressed text-accent" : "glass-card text-text-muted"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10">
        {apps && apps.length > 0 ? (
          <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(apps as App[]).map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </AnimatedGrid>
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
            No apps match your search.
          </div>
        )}
      </div>
    </div>
  );
}
