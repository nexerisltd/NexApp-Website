"use server";

import { randomUUID } from "crypto";
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
  // Mandatory for outside developers (unlike the optional version on the
  // admin app form) — every public submission needs a repo our review
  // team can actually test against before it goes live.
  github_url: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .max(300)
    .refine(
      (url) => /^https:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/i.test(url),
      "Must be a link to a GitHub repository (https://github.com/owner/repo)."
    ),
});

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
    github_url: (formData.get("github_url") as string) || "",
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

  // Uploads happen client-side (real progress bars) before this action
  // ever runs — only accept the resulting URLs if they truly point at our
  // own storage bucket, so a tampered hidden field can't smuggle anything
  // else in.
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

  const sourcePublic = formData.get("source_public") === "on";

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
    github_url: fields.github_url,
    source_public: sourcePublic,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(safeError("submitApp:insert", error))}`);
  }

  redirect("/submit?saved=1");
}
