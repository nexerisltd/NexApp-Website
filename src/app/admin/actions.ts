"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
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

async function uploadAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  folder: "icons" | "screenshots" | "covers"
) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function saveApp(formData: FormData) {
  const supabase = await createClient();

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

  // Icon: a newly uploaded file wins, otherwise keep whatever was there before.
  let iconUrl = (formData.get("existing_icon_url") as string) || null;
  const iconFile = formData.get("icon_file") as File | null;
  if (iconFile && iconFile.size > 0) {
    iconUrl = await uploadAsset(supabase, iconFile, "icons");
  }

  // Cover: same pattern as the icon above — a newly uploaded file wins,
  // otherwise keep whatever cover was already set (or none).
  let coverUrl = (formData.get("existing_cover_url") as string) || null;
  const coverFile = formData.get("cover_file") as File | null;
  if (coverFile && coverFile.size > 0) {
    coverUrl = await uploadAsset(supabase, coverFile, "covers");
  }
  const coverPosition = (formData.get("cover_position") as string) || "50% 50%";

  // Screenshots: keep existing ones (each tagged with a platform group) and
  // append any newly uploaded files, tagged with the group chosen for them.
  let screenshots: { url: string; group: string }[] = [];
  try {
    screenshots = JSON.parse((formData.get("existing_screenshots") as string) || "[]");
  } catch {
    screenshots = [];
  }
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
      const url = await uploadAsset(supabase, file, "screenshots");
      screenshots.push({ url, group: newGroups[i] || "desktop" });
    }
  }

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
  };

  if (id) {
    const { error } = await supabase.from("apps").update(payload).eq("id", id);
    if (error) throw new Error(`Could not update app: ${error.message}`);
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("apps")
      .insert({ ...payload, created_by: user?.id });
    if (error) throw new Error(`Could not create app: ${error.message}`);
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
  if (error) throw new Error(`Could not delete app: ${error.message}`);
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
  if (error) throw new Error(`Could not update status: ${error.message}`);
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function bulkSetStatus(ids: string[], status: "published" | "draft") {
  const supabase = await createClient();
  const { error } = await supabase.from("apps").update({ status }).in("id", ids);
  if (error) throw new Error(`Could not update apps: ${error.message}`);
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function bulkDelete(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("apps").delete().in("id", ids);
  if (error) throw new Error(`Could not delete apps: ${error.message}`);
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}
