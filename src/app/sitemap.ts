import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexappog.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/source`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    // Public anon client — no cookies needed, this only reads published apps.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: apps } = await supabase
      .from("apps")
      .select("slug, updated_at")
      .eq("status", "published");

    const appRoutes: MetadataRoute.Sitemap = (apps ?? []).map((app) => ({
      url: `${SITE_URL}/shop/${app.slug}`,
      lastModified: app.updated_at ? new Date(app.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...appRoutes];
  } catch {
    // If Supabase env vars aren't available at build time, still ship the
    // static routes instead of failing the whole build.
    return staticRoutes;
  }
}
