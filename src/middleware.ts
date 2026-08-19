import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const shortIdMatch = /^\/(\d{6})$/.exec(pathname);

  // Vanity short URL: /123456 -> /shop/<slug>. Handled in middleware (not a
  // file-based route) so it can't collide with other dynamic segments like
  // /shop/[slug].
  if (shortIdMatch) {
    const appCode = shortIdMatch[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("apps")
      .select("slug")
      .eq("app_code", appCode)
      .eq("status", "published")
      .single();

    if (data?.slug) {
      return NextResponse.redirect(new URL(`/shop/${data.slug}`, request.url));
    }
    // No match — fall through so it 404s normally.
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
