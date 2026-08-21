"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeError } from "@/lib/errors";

const applySchema = z.object({
  note: z.string().trim().min(10, "Give a bit more detail (at least 10 characters).").max(1000),
});

export async function applyForDev(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { allowed, error: rateLimitError } = await checkRateLimit(
    supabase,
    `apply_dev:${user.id}`,
    { maxHits: 3, windowSeconds: 60 * 60 * 24 }
  );
  if (!allowed) {
    redirect(`/apply-dev?error=${encodeURIComponent(rateLimitError!)}`);
  }

  const parsed = applySchema.safeParse({ note: formData.get("note") as string });
  if (!parsed.success) {
    redirect(`/apply-dev?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      dev_status: "pending",
      dev_application_note: parsed.data!.note,
      dev_reject_reason: null,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/apply-dev?error=${encodeURIComponent(safeError("applyForDev", error))}`);
  }

  revalidatePath("/apply-dev");
  redirect("/apply-dev?saved=1");
}
