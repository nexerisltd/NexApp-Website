"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function SavedToast({ saved }: { saved: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (saved) {
      toast("App saved successfully", "success");
      router.replace("/admin");
    }
  }, [saved, router]);

  return null;
}
