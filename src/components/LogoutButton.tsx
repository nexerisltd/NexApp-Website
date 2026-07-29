"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <motion.button
      onClick={handleLogout}
      whileTap={{ scale: 0.96 }}
      className="text-sm text-text-muted transition-colors hover:text-text"
    >
      Log out
    </motion.button>
  );
}
