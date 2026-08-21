"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeError } from "@/lib/errors";
import { coverPositionSchema } from "@/lib/validation/billboard";
import { isTrustedAssetUrl } from "@/lib/assetUrl";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Optional for admin-created apps (unlike the mandatory version on the
// public /submit form) — admins may be adding an in-house app with no
// public repo yet.
const githubUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .max(300)
  .optional()
  .or(z.literal(""));

export async function saveApp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { allowed, error: rateLimitError } = await checkRateLimit(
    supabase,
    `app_save:${user.id}`,
    { maxHits: 30, windowSeconds: 60 }
  );
  if (!allowed) throw new Error(rateLimitError);

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string).trim();

  let platformLinks: { label: string; url: string; group: string }[] = [];
  try {
    platformLinks = JSON.parse((formData.get("platform_links") as string) || "[]");
  } catch {
    platformLinks = [];
  }
  platformLinks = platformLinks.filter((l) => l.label && l.url);
  if (platformLinks.length === 0) {
    throw new Error("Add at least one platform with a download link.");
  }

  // Uploads now happen client-side directly to Storage (for real progress
  // bars) — these hidden fields carry the resulting URLs, not raw files.
  // Still re-verified server-side: only accept URLs that actually point at
  // our own bucket, so a tampered hidden field can't smuggle in anything else.
  const iconUrlRaw = (formData.get("icon_url") as string) || null;
  const iconUrl = isTrustedAssetUrl(iconUrlRaw) ? iconUrlRaw : null;

  const coverUrlRaw = (formData.get("cover_url") as string) || null;
  const coverUrl = isTrustedAssetUrl(coverUrlRaw) ? coverUrlRaw : null;

  const coverPositionRaw = (formData.get("cover_position") as string) || "50% 50%";
  const coverPositionParsed = coverPositionSchema.safeParse(coverPositionRaw);
  const coverPosition = coverPositionParsed.success ? coverPositionParsed.data : "50% 50%";

  let screenshots: { url: string; group: string }[] = [];
  try {
    screenshots = JSON.parse((formData.get("screenshots_json") as string) || "[]");
  } catch {
    screenshots = [];
  }
  screenshots = screenshots.filter((s) => isTrustedAssetUrl(s.url));

  const githubUrlInput = ((formData.get("github_url") as string) || "").trim();
  const githubUrlParsed = githubUrlSchema.safeParse(githubUrlInput);
  const githubUrl =
    githubUrlParsed.success && githubUrlParsed.data ? githubUrlParsed.data : null;
  const sourcePublic = formData.get("source_public") === "on";

  const defaultPlatform = (formData.get("default_platform") as string) || "desktop";

  const payload = {
    name,
    slug: slugify(name),
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    category_id: (formData.get("category_id") as string) || null,
    icon_url: iconUrl,
    cover_url: coverUrl,
    cover_position: coverPosition,
    screenshots,
    version: (formData.get("version") as string) || "1.0.0",
    size_label: (formData.get("size_label") as string) || null,
    platform_links: platformLinks,
    default_platform: defaultPlatform,
    status: formData.get("status") as string,
    github_url: githubUrl,
    source_public: sourcePublic,
  };

  if (id) {
    const { error } = await supabase.from("apps").update(payload).eq("id", id);
    if (error) throw new Error(safeError("saveApp:update", error));
  } else {
    const { error } = await supabase
      .from("apps")
      .insert({ ...payload, created_by: user.id });
    if (error) throw new Error(safeError("saveApp:insert", error));
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin?saved=1");
}

export async function deleteApp(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const { error } = await supabase.from("apps").delete().eq("id", id);
  if (error) throw new Error(safeError("deleteApp", error));
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function toggleStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const { error } = await supabase
    .from("apps")
    .update({ status: status === "published" ? "draft" : "published" })
    .eq("id", id);
  if (error) throw new Error(safeError("toggleStatus", error));
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function bulkSetStatus(ids: string[], status: "published" | "draft") {
  const supabase = await createClient();
  const { error } = await supabase.from("apps").update({ status }).in("id", ids);
  if (error) throw new Error(safeError("bulkSetStatus", error));
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function bulkDelete(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("apps").delete().in("id", ids);
  if (error) throw new Error(safeError("bulkDelete", error));
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}
