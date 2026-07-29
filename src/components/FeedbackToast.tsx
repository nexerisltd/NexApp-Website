"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function FeedbackToast({
  saved,
  error,
  successMessage = "Done",
  redirectTo,
}: {
  saved?: boolean;
  error?: string;
  successMessage?: string;
  redirectTo: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast(error, "error");
      router.replace(redirectTo);
    } else if (saved) {
      toast(successMessage, "success");
      router.replace(redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, error]);

  return null;
}