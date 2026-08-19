"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function resolveReport(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
  if (error) throw new Error(`Could not update report: ${error.message}`);
  revalidatePath("/admin/reports");
}

export async function dismissReport(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const { error } = await supabase.from("reports").update({ status: "dismissed" }).eq("id", id);
  if (error) throw new Error(`Could not update report: ${error.message}`);
  revalidatePath("/admin/reports");
}

export async function unpublishReportedApp(formData: FormData) {
  const supabase = await createClient();
  const appId = formData.get("app_id") as string;
  const reportId = formData.get("id") as string;
  const { error: appError } = await supabase
    .from("apps")
    .update({ status: "draft" })
    .eq("id", appId);
  if (appError) throw new Error(`Could not unpublish app: ${appError.message}`);

  const { error: reportError } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);
  if (reportError) throw new Error(`Could not update report: ${reportError.message}`);

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/");
}
