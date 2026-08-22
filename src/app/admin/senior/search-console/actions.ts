"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/errors";

const schema = z.object({
  google_site_verification_meta: z.string().trim().max(200).nullable(),
  google_html_verification_filename: z
    .string()
    .trim()
    .regex(/^google[a-f0-9]+\.html$/i, "Doesn't look like a Google verification filename.")
    .nullable()
    .or(z.literal("")),
  google_html_verification_content: z.string().trim().max(500).nullable(),
  dns_txt_host: z.string().trim().max(200).nullable(),
  dns_txt_value: z.string().trim().max(500).nullable(),
  dns_cname_host: z.string().trim().max(200).nullable(),
  dns_cname_value: z.string().trim().max(500).nullable(),
});

function orNull(v: FormDataEntryValue | null) {
  const s = ((v as string) || "").trim();
  return s || null;
}

export async function saveSearchConsoleSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isSeniorAdmin } = await supabase.rpc("is_senior_admin", { uid: user.id });
  if (!isSeniorAdmin) redirect("/admin");

  const parsed = schema.safeParse({
    google_site_verification_meta: orNull(formData.get("google_site_verification_meta")),
    google_html_verification_filename: orNull(formData.get("google_html_verification_filename")),
    google_html_verification_content: orNull(formData.get("google_html_verification_content")),
    dns_txt_host: orNull(formData.get("dns_txt_host")),
    dns_txt_value: orNull(formData.get("dns_txt_value")),
    dns_cname_host: orNull(formData.get("dns_cname_host")),
    dns_cname_value: orNull(formData.get("dns_cname_value")),
  });

  if (!parsed.success) {
    redirect(
      `/admin/senior/search-console?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input.")}`
    );
  }

  const { error } = await supabase
    .from("site_verification_settings")
    .update({ ...parsed.data!, updated_by: user.id })
    .eq("id", true);

  if (error) {
    redirect(
      `/admin/senior/search-console?error=${encodeURIComponent(safeError("saveSearchConsoleSettings", error))}`
    );
  }

  revalidatePath("/admin/senior/search-console");
  revalidatePath("/", "layout");
  redirect("/admin/senior/search-console?saved=1");
}
