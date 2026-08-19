"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveSource(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const app_id = formData.get("app_id") as string;
  const github_url = (formData.get("github_url") as string).trim();

  if (!app_id || !github_url) {
    throw new Error("Select an app and provide a GitHub repository link.");
  }

  if (id) {
    const { error } = await supabase
      .from("sources")
      .update({ app_id, github_url })
      .eq("id", id);
    if (error) throw new Error(`Could not update source: ${error.message}`);
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("sources")
      .upsert(
        { app_id, github_url, created_by: user?.id },
        { onConflict: "app_id" }
      );
    if (error) throw new Error(`Could not create source: ${error.message}`);
  }

  revalidatePath("/admin/source");
  revalidatePath("/source");
  revalidatePath("/shop");
  redirect("/admin/source?saved=1");
}

export async function deleteSource(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const { error } = await supabase.from("sources").delete().eq("id", id);
  if (error) throw new Error(`Could not delete source: ${error.message}`);
  revalidatePath("/admin/source");
  revalidatePath("/source");
  revalidatePath("/shop");
}
