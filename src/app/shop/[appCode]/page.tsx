import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppCodeRedirect({
  params,
}: {
  params: Promise<{ appCode: string }>;
}) {
  const { appCode } = await params;

  // Only handle 6-digit App ID codes here — anything else genuinely 404s,
  // so this route never swallows unrelated unmatched paths.
  if (!/^\d{6}$/.test(appCode)) notFound();

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("apps")
    .select("slug")
    .eq("app_code", appCode)
    .eq("status", "published")
    .single();

  if (!app) notFound();

  redirect(`/shop/${app.slug}`);
}
