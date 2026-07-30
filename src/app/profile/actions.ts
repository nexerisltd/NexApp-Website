"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccount() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect("/?goodbye=1");
}
