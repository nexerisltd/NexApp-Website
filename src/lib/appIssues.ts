import type { createClient } from "@/lib/supabase/server";

export async function upsertActiveAppIssue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    appId: string;
    title: string;
    description: string | null;
    downloadBlocked: boolean;
    createdBy: string;
  }
) {
  // Only one active issue per app at a time — resolve any existing one
  // first so the banner never shows two conflicting messages.
  await supabase
    .from("app_issues")
    .update({ active: false, resolved_at: new Date().toISOString() })
    .eq("app_id", params.appId)
    .eq("active", true);

  return supabase.from("app_issues").insert({
    app_id: params.appId,
    title: params.title,
    description: params.description,
    download_blocked: params.downloadBlocked,
    created_by: params.createdBy,
  });
}
