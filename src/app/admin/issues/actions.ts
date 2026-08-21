"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rateLimit";
import { upsertActiveAppIssue } from "@/lib/appIssues";

const issueSchema = z.object({
  app_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().max(2000).nullable(),
  download_blocked: z.boolean(),
});

async function revalidateAppPages(appId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/${appId}/edit`);
  const supabase = await createClient();
  const { data } = await supabase.from("apps").select("slug").eq("id", appId).single();
  if (data?.slug) revalidatePath(`/shop/${data.slug}`);
}

export async function postAppIssue(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { allowed, error: rateLimitError } = await checkRateLimit(
    supabase,
    `app_issue_post:${user.id}`,
    { maxHits: 30, windowSeconds: 60 }
  );
  if (!allowed) throw new Error(rateLimitError);

  const parsed = issueSchema.safeParse({
    app_id: formData.get("app_id") as string,
    title: formData.get("title") as string,
    description: ((formData.get("description") as string) || "").trim() || null,
    download_blocked: formData.get("download_blocked") === "on",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid issue data.");
  }
  const { app_id, ...rest } = parsed.data;

  const { error } = await upsertActiveAppIssue(supabase, {
    appId: app_id,
    title: rest.title,
    description: rest.description,
    downloadBlocked: rest.download_blocked,
    createdBy: user.id,
  });
  if (error) throw new Error(safeError("postAppIssue", error));

  await revalidateAppPages(app_id);
}

export async function resolveAppIssue(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const app_id = formData.get("app_id") as string;

  const { error } = await supabase
    .from("app_issues")
    .update({ active: false, resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(safeError("resolveAppIssue", error));

  await revalidateAppPages(app_id);
}
