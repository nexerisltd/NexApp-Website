import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Google's "HTML file" verification method requires the file to be
// reachable at the domain root with the exact filename it generated (e.g.
// /google1234567890abcdef.html) — this route matches that shape and
// serves whatever a senior admin has configured, so uploading the file
// Google gives you is genuinely all that's needed (no manual deploy step).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!/^google[a-f0-9]+\.html$/i.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_verification_settings")
    .select("google_html_verification_filename, google_html_verification_content")
    .eq("id", true)
    .maybeSingle();

  if (
    !data?.google_html_verification_content ||
    data.google_html_verification_filename !== filename
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(data.google_html_verification_content, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
