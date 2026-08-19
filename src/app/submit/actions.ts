"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ASSET_BUCKET = "app-assets";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uploadSubmissionAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  folder: "icons" | "screenshots"
) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `submissions/${userId}/${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function submitApp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (formData.get("name") as string).trim();
  if (!name) {
    redirect("/submit?error=" + encodeURIComponent("App name is required."));
  }

  let platformLinks: { label: string; url: string; group: string }[] = [];
  try {
    platformLinks = JSON.parse((formData.get("platform_links") as string) || "[]");
  } catch {
    platformLinks = [];
  }
  platformLinks = platformLinks.filter((l) => l.label && l.url);
  if (platformLinks.length === 0) {
    redirect(
      "/submit?error=" + encodeURIComponent("Add at least one platform with a download link.")
    );
  }

  let iconUrl: string | null = null;
  const iconFile = formData.get("icon_file") as File | null;
  if (iconFile && iconFile.size > 0) {
    iconUrl = await uploadSubmissionAsset(supabase, user.id, iconFile, "icons");
  }

  const screenshots: { url: string; group: string }[] = [];
  let newGroups: string[] = [];
  try {
    newGroups = JSON.parse((formData.get("screenshot_groups") as string) || "[]");
  } catch {
    newGroups = [];
  }
  const screenshotFiles = formData.getAll("screenshot_files") as File[];
  for (let i = 0; i < screenshotFiles.length; i++) {
    const file = screenshotFiles[i];
    if (file && file.size > 0) {
      const url = await uploadSubmissionAsset(supabase, user.id, file, "screenshots");
      screenshots.push({ url, group: newGroups[i] || "desktop" });
    }
  }

  const defaultPlatform = (formData.get("default_platform") as string) || "desktop";
  const baseSlug = slugify(name);
  // Submissions can share a name with something already published, so make
  // the slug unique by appending a short suffix — admins can rename on
  // approval if they want something cleaner.
  const slug = `${baseSlug}-${randomUUID().slice(0, 6)}`;

  const { error } = await supabase.from("apps").insert({
    name,
    slug,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    category_id: (formData.get("category_id") as string) || null,
    icon_url: iconUrl,
    screenshots,
    version: (formData.get("version") as string) || "1.0.0",
    size_label: (formData.get("size_label") as string) || null,
    platform_links: platformLinks,
    default_platform: defaultPlatform,
    status: "pending",
    created_by: user.id,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/submit?saved=1");
}
