"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitReport({
  appId,
  reason,
  details,
}: {
  appId: string;
  reason: string;
  details: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in to report an app." };
  }

  const { error } = await supabase.from("reports").insert({
    app_id: appId,
    user_id: user.id,
    reason,
    details: details.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
