"use client";

import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AddAccountButton() {
  const supabase = createClient();

  async function handleClick() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="neu-raised flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
    >
      <UserPlus size={15} /> Add account
    </button>
  );
}
