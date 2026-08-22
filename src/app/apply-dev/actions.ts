"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeError } from "@/lib/errors";

const DEV_AREAS = ["android", "ios", "web", "desktop", "backend", "game_dev", "other"] as const;

const verificationSchema = z.object({
  full_legal_name: z.string().trim().min(2, "Enter your full legal name.").max(120),
  display_name: z.string().trim().min(2, "Enter a display name.").max(60),
  country: z.string().trim().min(2, "Select your country.").max(60),
  date_of_birth: z.string().refine((v) => {
    const age = (Date.now() - new Date(v).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 16 && age < 120;
  }, "You must be at least 16 years old."),
  phone_number: z.string().trim().min(6, "Enter a valid phone number.").max(25),
  gov_id_type: z.enum(["nid", "passport", "driving_license"]),
  gov_id_document_path: z.string().min(1, "Upload your government ID."),
  selfie_path: z.string().min(1, "Upload a selfie."),
  bio: z.string().trim().max(1000).nullable(),
  portfolio_url: z.string().trim().url().max(300).nullable().or(z.literal("")),
  github_url: z.string().trim().url().max(300).nullable().or(z.literal("")),
  previous_projects: z.string().trim().max(1000).nullable(),
  dev_areas: z.array(z.enum(DEV_AREAS)).min(1, "Pick at least one area of development."),
  agreement_accepted: z.literal(true, { message: "You must accept the Developer Agreement." }),
  ownership_declaration: z.literal(true, { message: "You must confirm the app ownership declaration." }),
  ip_responsibility_declaration: z.literal(true, { message: "You must accept IP responsibility." }),
  content_policy_accepted: z.literal(true, { message: "You must accept the content & malware policy." }),
  privacy_policy_accepted: z.literal(true, { message: "You must accept the Privacy Policy." }),
  false_info_agreement: z.literal(true, { message: "You must agree to the false-information clause." }),
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

  const parsed = verificationSchema.safeParse({
    full_legal_name: formData.get("full_legal_name") as string,
    display_name: formData.get("display_name") as string,
    country: formData.get("country") as string,
    date_of_birth: formData.get("date_of_birth") as string,
    phone_number: formData.get("phone_number") as string,
    gov_id_type: formData.get("gov_id_type") as string,
    gov_id_document_path: formData.get("gov_id_document_path") as string,
    selfie_path: formData.get("selfie_path") as string,
    bio: ((formData.get("bio") as string) || "").trim() || null,
    portfolio_url: (formData.get("portfolio_url") as string) || "",
    github_url: (formData.get("github_url") as string) || "",
    previous_projects: ((formData.get("previous_projects") as string) || "").trim() || null,
    dev_areas: formData.getAll("dev_areas") as string[],
    agreement_accepted: formData.get("agreement_accepted") === "on",
    ownership_declaration: formData.get("ownership_declaration") === "on",
    ip_responsibility_declaration: formData.get("ip_responsibility_declaration") === "on",
    content_policy_accepted: formData.get("content_policy_accepted") === "on",
    privacy_policy_accepted: formData.get("privacy_policy_accepted") === "on",
    false_info_agreement: formData.get("false_info_agreement") === "on",
  });

  if (!parsed.success) {
    redirect(`/apply-dev?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input.")}`);
  }
  const fields = parsed.data!;

  // Re-applying after a rejection updates the same request rather than
  // creating a new one, so the request number stays stable.
  const { data: existing } = await supabase
    .from("dev_verifications")
    .select("id, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing && existing.status === "pending") {
    redirect(`/apply-dev?error=${encodeURIComponent("You already have a request being reviewed.")}`);
  }

  const payload = {
    full_legal_name: fields.full_legal_name,
    display_name: fields.display_name,
    country: fields.country,
    date_of_birth: fields.date_of_birth,
    phone_number: fields.phone_number,
    gov_id_type: fields.gov_id_type,
    gov_id_document_url: fields.gov_id_document_path,
    selfie_url: fields.selfie_path,
    bio: fields.bio,
    portfolio_url: fields.portfolio_url || null,
    github_url: fields.github_url || null,
    previous_projects: fields.previous_projects,
    dev_areas: fields.dev_areas,
    agreement_accepted: fields.agreement_accepted,
    ownership_declaration: fields.ownership_declaration,
    ip_responsibility_declaration: fields.ip_responsibility_declaration,
    content_policy_accepted: fields.content_policy_accepted,
    privacy_policy_accepted: fields.privacy_policy_accepted,
    false_info_agreement: fields.false_info_agreement,
    status: "pending" as const,
    reject_reason: null,
    identity_match_confirmed: false,
  };

  if (existing) {
    const { error } = await supabase
      .from("dev_verifications")
      .update(payload)
      .eq("id", existing.id);
    if (error) redirect(`/apply-dev?error=${encodeURIComponent(safeError("applyForDev:update", error))}`);
  } else {
    const { data: requestNumber } = await supabase.rpc("generate_dev_request_number");
    const { error } = await supabase.from("dev_verifications").insert({
      ...payload,
      profile_id: user.id,
      request_number: requestNumber,
    });
    if (error) redirect(`/apply-dev?error=${encodeURIComponent(safeError("applyForDev:insert", error))}`);
  }

  // Keep profiles.dev_status in step immediately — the approve/reject
  // transition back out of 'pending' is handled by the DB trigger
  // (sync_dev_status_from_verification), which also fires the existing
  // notification trigger since it only triggers off a 'pending' starting
  // point.
  const { error: statusError } = await supabase
    .from("profiles")
    .update({ dev_status: "pending" })
    .eq("id", user.id);
  if (statusError) {
    redirect(`/apply-dev?error=${encodeURIComponent(safeError("applyForDev:status", statusError))}`);
  }

  revalidatePath("/apply-dev");
  redirect("/apply-dev?saved=1");
}
