"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/errors";

export async function approveDevVerification(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Approval means the admin has manually reviewed everything by hand:
  // ID vs selfie, and the phone number looks legitimate. There's no
  // automated SMS OTP step (that would need a paid third-party provider),
  // so this checkbox-gated approval is the actual verification.
  const { error } = await supabase
    .from("dev_verifications")
    .update({
      status: "approved",
      identity_match_confirmed: true,
      phone_verified: true,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  // profiles.dev_status/display_name/country sync automatically via the
  // sync_dev_status_from_verification DB trigger.

  if (error) {
    redirect(`/admin/developers?error=${encodeURIComponent(safeError("approveDevVerification", error))}`);
  }
  revalidatePath("/admin/developers");
  redirect("/admin/developers?saved=1");
}

export async function rejectDevVerification(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const reason = ((formData.get("reason") as string) || "").trim();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!reason) {
    redirect(
      `/admin/developers?error=${encodeURIComponent("Give a short reason so the developer knows why.")}`
    );
  }

  const { error } = await supabase
    .from("dev_verifications")
    .update({
      status: "rejected",
      reject_reason: reason,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/developers?error=${encodeURIComponent(safeError("rejectDevVerification", error))}`);
  }
  revalidatePath("/admin/developers");
  redirect("/admin/developers?saved=1");
}
