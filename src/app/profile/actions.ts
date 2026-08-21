"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ASSET_BUCKET = "app-assets";

export async function deleteAccount() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect("/?goodbye=1");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName = (formData.get("full_name") as string | null)?.trim() || null;
  const headline = ((formData.get("profile_headline") as string | null) || "").trim() || null;
  const bio = ((formData.get("profile_bio") as string | null) || "").trim() || null;
  const existingAvatarUrl = (formData.get("existing_avatar_url") as string | null) || null;
  const avatarFile = formData.get("avatar_file") as File | null;

  let avatarUrl = existingAvatarUrl;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "png";
    const path = `avatars/${user.id}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(ASSET_BUCKET)
      .upload(path, avatarFile, { contentType: avatarFile.type, upsert: true });

    if (uploadError) {
      redirect(`/profile?error=${encodeURIComponent(uploadError.message)}`);
    }

    const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
      profile_headline: headline,
      profile_bio: bio,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  revalidatePath(`/developers/${user.id}`);
  redirect("/profile?saved=1");
}
