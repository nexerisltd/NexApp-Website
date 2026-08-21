"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeError } from "@/lib/errors";

const requestSchema = z.object({
  app_id: z.string().uuid("Select an app."),
  target_admin_id: z.string().uuid("Select an admin to send this to."),
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  download_blocked: z.boolean(),
  eta_start: z.string().nullable(),
  eta_end: z.string().nullable(),
});

export async function submitIssueRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("dev_status")
    .eq("id", user.id)
    .single();
  if (profile?.dev_status !== "verified") {
    redirect(
      `/dashboard/issues/new?error=${encodeURIComponent("Only verified developers can send issue requests.")}`
    );
  }

  const parsed = requestSchema.safeParse({
    app_id: formData.get("app_id") as string,
    target_admin_id: formData.get("target_admin_id") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    download_blocked: formData.get("download_blocked") === "on",
    eta_start: (formData.get("eta_start") as string) || null,
    eta_end: (formData.get("eta_end") as string) || null,
  });
  if (!parsed.success) {
    redirect(
      `/dashboard/issues/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input.")}`
    );
  }
  const fields = parsed.data!;

  // Confirm the app actually belongs to this developer — otherwise anyone
  // verified could file requests against apps they don't own.
  const { data: app } = await supabase
    .from("apps")
    .select("id, created_by")
    .eq("id", fields.app_id)
    .single();
  if (!app || app.created_by !== user.id) {
    redirect(
      `/dashboard/issues/new?error=${encodeURIComponent("You can only report issues on your own apps.")}`
    );
  }

  // Two independent limits, both enforced: at most 1 request to any given
  // admin every 15 minutes, and at most 1 request for a given app every
  // hour (to any admin at all) — thresholds are parameters here, not
  // hardcoded into the limiter itself.
  const perAdmin = await checkRateLimit(
    supabase,
    `issue_request_pair:${user.id}:${fields.target_admin_id}`,
    { maxHits: 1, windowSeconds: 15 * 60 }
  );
  if (!perAdmin.allowed) {
    redirect(`/dashboard/issues/new?error=${encodeURIComponent(perAdmin.error!)}`);
  }

  const perApp = await checkRateLimit(
    supabase,
    `issue_request_app:${fields.app_id}`,
    { maxHits: 1, windowSeconds: 60 * 60 }
  );
  if (!perApp.allowed) {
    redirect(
      `/dashboard/issues/new?error=${encodeURIComponent(
        "A request was already sent for this app in the last hour — please wait before sending another."
      )}`
    );
  }

  const { error } = await supabase.from("issue_requests").insert({
    app_id: fields.app_id,
    requested_by: user.id,
    target_admin_id: fields.target_admin_id,
    original_admin_id: fields.target_admin_id,
    title: fields.title,
    description: fields.description,
    download_blocked: fields.download_blocked,
    eta_start: fields.eta_start,
    eta_end: fields.eta_end,
  });

  if (error) {
    redirect(
      `/dashboard/issues/new?error=${encodeURIComponent(safeError("submitIssueRequest", error))}`
    );
  }

  revalidatePath("/dashboard/issues");
  redirect("/dashboard/issues?saved=1");
}
