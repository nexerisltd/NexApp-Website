"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateImageFile } from "@/lib/fileValidation";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeError } from "@/lib/errors";
import { coverPositionSchema } from "@/lib/validation/billboard";

const ASSET_BUCKET = "app-assets";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Strict schema for the text fields on a public submission — this is the
// most exposed write path in the app (any signed-in user can call it), so
// every field is bounded rather than accepted as-is.
const submitAppSchema = z.object({
  name: z.string().trim().min(1, "App name is required.").max(80),
  tagline: z.string().trim().max(140).nullable(),
  description: z.string().trim().max(4000).nullable(),
  category_id: z.string().uuid().nullable(),
  version: z.string().trim().max(30),
  size_label: z.string().trim().max(30).nullable(),
  default_platform: z.string().trim().max(30),
});

async function uploadSubmissionAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  folder: "icons" | "screenshots" | "covers"
) {
  const validation = await validateImageFile(file);
  if (!validation.ok) throw new Error(validation.error);

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `submissions/${userId}/${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(safeError(`uploadSubmissionAsset:${folder}`, error));

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function submitApp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // The most abuse-prone endpoint in the app (public, authenticated,
  // creates DB rows + uploads files) gets the strictest limit of any
  // server action here.
  const { allowed, error: rateLimitError } = await checkRateLimit(
    supabase,
    `submit_app:${user.id}`,
    { maxHits: 5, windowSeconds: 60 * 60 }
  );
  if (!allowed) {
    redirect(`/submit?error=${encodeURIComponent(rateLimitError!)}`);
  }

  const parsed = submitAppSchema.safeParse({
    name: formData.get("name") as string,
    tagline: (formData.get("tagline") as string | null) || null,
    description: (formData.get("description") as string | null) || null,
    category_id: (formData.get("category_id") as string) || null,
    version: (formData.get("version") as string) || "1.0.0",
    size_label: (formData.get("size_label") as string | null) || null,
    default_platform: (formData.get("default_platform") as string) || "desktop",
  });

  if (!parsed.success) {
    redirect(
      `/submit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input.")}`
    );
  }
  const fields = parsed.data;

  let platformLinks: { label: string; url: string; group: string }[] = [];
  try {
    platformLinks = JSON.parse((formData.get("platform_links") as string) || "[]");
  } catch {
    platformLinks = [];
  }
  platformLinks = platformLinks
    .filter(
      (l) =>
        l &&
        typeof l.label === "string" &&
        typeof l.url === "string" &&
        l.label.length <= 40 &&
        l.url.length <= 500
    )
    .slice(0, 10);
  if (platformLinks.length === 0) {
    redirect(
      "/submit?error=" + encodeURIComponent("Add at least one platform with a download link.")
    );
  }

  let iconUrl: string | null = null;
  let coverUrl: string | null = null;
  try {
    const iconFile = formData.get("icon_file") as File | null;
    if (iconFile && iconFile.size > 0) {
      iconUrl = await uploadSubmissionAsset(supabase, user.id, iconFile, "icons");
    }

    const coverFile = formData.get("cover_file") as File | null;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadSubmissionAsset(supabase, user.id, coverFile, "covers");
    }
  } catch (err) {
    redirect(`/submit?error=${encodeURIComponent((err as Error).message)}`);
  }

  const coverPositionRaw = (formData.get("cover_position") as string) || "50% 50%";
  const coverPositionParsed = coverPositionSchema.safeParse(coverPositionRaw);
  const coverPosition = coverPositionParsed.success ? coverPositionParsed.data : "50% 50%";

  const screenshots: { url: string; group: string }[] = [];
  let newGroups: string[] = [];
  try {
    newGroups = JSON.parse((formData.get("screenshot_groups") as string) || "[]");
  } catch {
    newGroups = [];
  }
  const screenshotFiles = (formData.getAll("screenshot_files") as File[]).slice(0, 10);
  for (let i = 0; i < screenshotFiles.length; i++) {
    const file = screenshotFiles[i];
    if (file && file.size > 0) {
      try {
        const url = await uploadSubmissionAsset(supabase, user.id, file, "screenshots");
        screenshots.push({ url, group: newGroups[i] || "desktop" });
      } catch (err) {
        redirect(`/submit?error=${encodeURIComponent((err as Error).message)}`);
      }
    }
  }

  const baseSlug = slugify(fields.name);
  // Submissions can share a name with something already published, so make
  // the slug unique by appending a short suffix — admins can rename on
  // approval if they want something cleaner.
  const slug = `${baseSlug}-${randomUUID().slice(0, 6)}`;

  const { error } = await supabase.from("apps").insert({
    name: fields.name,
    slug,
    tagline: fields.tagline,
    description: fields.description,
    category_id: fields.category_id,
    icon_url: iconUrl,
    cover_url: coverUrl,
    cover_position: coverPosition,
    screenshots,
    version: fields.version || "1.0.0",
    size_label: fields.size_label,
    platform_links: platformLinks,
    default_platform: fields.default_platform,
    status: "pending",
    created_by: user.id,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(safeError("submitApp:insert", error))}`);
  }

  redirect("/submit?saved=1");
}
