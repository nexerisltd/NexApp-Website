"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveBillboard(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string).trim();
  const app_id = formData.get("app_id") as string;
  const offer = ((formData.get("offer") as string) || "").trim() || null;
  const display_order = Number(formData.get("display_order")) || 0;
  const active = formData.get("active") === "on";

  if (!title || !app_id) {
    throw new Error("A title and an app selection are required.");
  }

  const payload = { title, app_id, offer, display_order, active };

  if (id) {
    const { error } = await supabase.from("billboards").update(payload).eq("id", id);
    if (error) throw new Error(`Could not update billboard: ${error.message}`);
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("billboards")
      .insert({ ...payload, created_by: user?.id });
    if (error) throw new Error(`Could not create billboard: ${error.message}`);
  }

  revalidatePath("/admin/billboards");
  revalidatePath("/");
  redirect("/admin/billboards?saved=1");
}

export async function deleteBillboard(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const { error } = await supabase.from("billboards").delete().eq("id", id);
  if (error) throw new Error(`Could not delete billboard: ${error.message}`);
  revalidatePath("/admin/billboards");
  revalidatePath("/");
}
