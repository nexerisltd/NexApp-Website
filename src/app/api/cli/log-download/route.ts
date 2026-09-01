import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/cli/log-download
// Body: { slug: string, platformLabel: string }
// Logs a download the same way the website's DownloadButton does (inserts
// into `downloads`), so CLI installs count toward downloads_count and show
// up in "My Downloads" for signed-in users.
export async function POST(request: NextRequest) {
  let body: { slug?: string; platformLabel?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, platformLabel } = body;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: app, error: appError } = await supabase
    .from("apps")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (appError || !app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  // Best-effort: identify the signed-in user if the CLI sent an auth cookie/token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: insertError } = await supabase.from("downloads").insert({
    app_id: app.id,
    platform_label: platformLabel ?? null,
    user_id: user?.id ?? null,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to log download", details: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ logged: true });
}
