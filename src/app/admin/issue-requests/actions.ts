"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/lib/errors";
import { upsertActiveAppIssue } from "@/lib/appIssues";

export async function claimIssueRequest(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { data: claimed, error } = await supabase.rpc("claim_issue_request", {
    p_request_id: id,
  });

  if (error) {
    redirect(`/admin/issue-requests?error=${encodeURIComponent(safeError("claimIssueRequest", error))}`);
  }
  if (!claimed) {
    redirect(
      `/admin/issue-requests?error=${encodeURIComponent(
        "This request isn't eligible to claim yet — either it's still within its first 10 minutes, or someone already responded."
      )}`
    );
  }

  revalidatePath("/admin/issue-requests");
  redirect("/admin/issue-requests?saved=1");
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["testing", "granted", "denied"]),
  status_note: z.string().trim().max(500).nullable(),
});

export async function updateIssueRequestStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = statusSchema.safeParse({
    id: formData.get("id") as string,
    status: formData.get("status") as string,
    status_note: ((formData.get("status_note") as string) || "").trim() || null,
  });
  if (!parsed.success) {
    redirect(
      `/admin/issue-requests?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input.")}`
    );
  }
  const { id, status, status_note } = parsed.data!;

  const { data: request } = await supabase
    .from("issue_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) {
    redirect(`/admin/issue-requests?error=${encodeURIComponent("Request not found.")}`);
  }
  if (request!.target_admin_id !== user.id) {
    redirect(
      `/admin/issue-requests?error=${encodeURIComponent(
        "Only the admin currently holding this request can update it — claim it first if it's been unanswered for 10+ minutes."
      )}`
    );
  }

  const { error } = await supabase
    .from("issue_requests")
    .update({ status, status_note })
    .eq("id", id);
  if (error) {
    redirect(
      `/admin/issue-requests?error=${encodeURIComponent(safeError("updateIssueRequestStatus", error))}`
    );
  }

  // "Granted & applied" means exactly that — the requested issue goes live
  // on the app's page right away, no separate manual step.
  if (status === "granted") {
    const { error: issueError } = await upsertActiveAppIssue(supabase, {
      appId: request!.app_id,
      title: request!.title,
      description: request!.description,
      downloadBlocked: request!.download_blocked,
      createdBy: user.id,
    });
    if (issueError) {
      redirect(
        `/admin/issue-requests?error=${encodeURIComponent(safeError("applyGrantedIssue", issueError))}`
      );
    }
  }

  revalidatePath("/admin/issue-requests");
  revalidatePath("/admin");
  redirect("/admin/issue-requests?saved=1");
}
