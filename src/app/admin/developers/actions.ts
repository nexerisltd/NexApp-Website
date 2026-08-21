"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/errors";

export async function approveDevApplication(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ dev_status: "verified", dev_reject_reason: null })
    .eq("id", id);
  if (error) {
    redirect(`/admin/developers?error=${encodeURIComponent(safeError("approveDev", error))}`);
  }
  revalidatePath("/admin/developers");
  redirect("/admin/developers?saved=1");
}

export async function rejectDevApplication(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const reason = ((formData.get("reason") as string) || "").trim();

  if (!reason) {
    redirect(
      `/admin/developers?error=${encodeURIComponent("Give a short reason so the developer knows why.")}`
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ dev_status: "rejected", dev_reject_reason: reason })
    .eq("id", id);
  if (error) {
    redirect(`/admin/developers?error=${encodeURIComponent(safeError("rejectDev", error))}`);
  }
  revalidatePath("/admin/developers");
  redirect("/admin/developers?saved=1");
}
