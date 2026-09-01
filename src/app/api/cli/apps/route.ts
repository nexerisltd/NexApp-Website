import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/cli/apps?q=searchterm&category=some-category-slug
// Returns a lightweight list of published apps for `nexapp search` / `nexapp list`.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() ?? "";
  const categorySlug = searchParams.get("category")?.trim() ?? "";

  const supabase = await createClient();

  let dbQuery = supabase
    .from("apps")
    .select(
      categorySlug
        ? "slug, name, tagline, icon_url, version, category:categories!inner(name, slug)"
        : "slug, name, tagline, icon_url, version, category:categories(name, slug)"
    )
    .eq("status", "published")
    .order("name", { ascending: true });

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  if (categorySlug) {
    dbQuery = dbQuery.eq("category.slug", categorySlug);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch apps", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ apps: data ?? [] });
}
