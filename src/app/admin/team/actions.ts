"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function promoteAdmin(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim();

  const { error } = await supabase.rpc("promote_to_admin", { target_email: email });

  revalidatePath("/admin/team");

  if (error) {
    redirect(`/admin/team?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin/team?saved=1");
}

export async function revokeAdmin(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.rpc("revoke_admin", { target_email: email });

  revalidatePath("/admin/team");

  if (error) {
    redirect(`/admin/team?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin/team?saved=1");
}
