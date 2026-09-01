import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/cli/apps/[slug]
// The [slug] segment accepts a slug, an app_code, OR the app's uuid id —
// so `nexapp install <slug-or-app-id>` works either way.
// Returns full app details + platform_links (each { label, url, group }).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: identifier } = await params;

  const supabase = await createClient();

  const orFilters = [`slug.eq.${identifier}`, `app_code.eq.${identifier}`];
  if (UUID_RE.test(identifier)) {
    orFilters.push(`id.eq.${identifier}`);
  }

  const { data: app, error } = await supabase
    .from("apps")
    .select(
      "id, slug, app_code, name, tagline, description, icon_url, version, github_url, platform_links, category:categories(name, slug)"
    )
    .or(orFilters.join(","))
    .eq("status", "published")
    .maybeSingle();

  if (error || !app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  return NextResponse.json(app);
}
