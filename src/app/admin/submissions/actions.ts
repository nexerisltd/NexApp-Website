"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveSubmission(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("apps")
    .update({ status: "published", review_note: null })
    .eq("id", id);
  if (error) throw new Error(`Could not approve: ${error.message}`);
  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function rejectSubmission(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const note = (formData.get("review_note") as string | null)?.trim() || null;
  // Marked declined rather than deleted, so the submitter can see the
  // outcome (and the optional reason) on their own dashboard instead of
  // their submission just silently vanishing.
  const { error } = await supabase
    .from("apps")
    .update({ status: "declined", review_note: note })
    .eq("id", id);
  if (error) throw new Error(`Could not reject: ${error.message}`);
  revalidatePath("/admin/submissions");
  revalidatePath("/dashboard");
}
