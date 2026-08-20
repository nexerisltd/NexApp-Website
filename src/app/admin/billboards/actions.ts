"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeError } from "@/lib/errors";
import { billboardSchema } from "@/lib/validation/billboard";

export async function saveBillboard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Admin action, so the limit is looser than a public endpoint, but still
  // capped — protects against a compromised session or a runaway script
  // hammering the database. Threshold is a parameter here, not baked into
  // the rate limiter itself.
  const { allowed, error: rateLimitError } = await checkRateLimit(
    supabase,
    `billboard_save:${user.id}`,
    { maxHits: 30, windowSeconds: 60 }
  );
  if (!allowed) throw new Error(rateLimitError);

  // Strict schema validation — reject anything malformed instead of just
  // sanitizing it.
  const parsed = billboardSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    title: formData.get("title") as string,
    app_id: formData.get("app_id") as string,
    offer: ((formData.get("offer") as string) || "").trim() || null,
    display_order: Number(formData.get("display_order")) || 0,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid billboard data.");
  }

  const { id, ...payload } = parsed.data;

  if (id) {
    const { error } = await supabase.from("billboards").update(payload).eq("id", id);
    if (error) throw new Error(safeError("saveBillboard:update", error));
  } else {
    const { error } = await supabase
      .from("billboards")
      .insert({ ...payload, created_by: user.id });
    if (error) throw new Error(safeError("saveBillboard:insert", error));
  }

  revalidatePath("/admin/billboards");
  revalidatePath("/");
  redirect("/admin/billboards?saved=1");
}

export async function deleteBillboard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { allowed, error: rateLimitError } = await checkRateLimit(
    supabase,
    `billboard_delete:${user.id}`,
    { maxHits: 30, windowSeconds: 60 }
  );
  if (!allowed) throw new Error(rateLimitError);

  const id = formData.get("id") as string;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Invalid billboard id.");
  }

  const { error } = await supabase.from("billboards").delete().eq("id", id);
  if (error) throw new Error(safeError("deleteBillboard", error));

  revalidatePath("/admin/billboards");
  revalidatePath("/");
}
