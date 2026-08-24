"use server";

import { createClient } from "@/lib/supabase/server";

export async function markUpdatesSeen() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ updates_last_seen_at: new Date().toISOString() })
    .eq("id", user.id);
}
