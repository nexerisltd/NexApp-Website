import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppCard from "@/components/AppCard";
import AnimatedGrid from "@/components/AnimatedGrid";
import type { App } from "@/lib/types";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("apps(*, categories(id, name, slug))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const apps = (favorites ?? [])
    .map((f) => (Array.isArray(f.apps) ? f.apps[0] : f.apps))
    .filter((a): a is App => !!a);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-2xl font-bold">Your favorites</h1>
      <p className="mt-1 text-sm text-text-muted">{user.email}</p>

      <div className="mt-10">
        {apps.length > 0 ? (
          <AnimatedGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </AnimatedGrid>
        ) : (
          <div className="glass-card rounded-2xl border border-dashed border-border p-10 text-center text-text-muted">
            You haven&apos;t favorited any apps yet.{" "}
            <Link href="/shop" className="underline underline-offset-4">
              Browse apps
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
