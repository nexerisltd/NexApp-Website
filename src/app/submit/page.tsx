import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SubmitAppForm from "@/components/SubmitAppForm";
import FeedbackToast from "@/components/FeedbackToast";
import type { Category } from "@/lib/types";

export default async function SubmitAppPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <FeedbackToast
        error={error}
        saved={saved === "1"}
        successMessage="Submitted! We'll review it soon."
        redirectTo="/submit"
      />

      <h1 className="font-display text-2xl font-bold">Submit an app</h1>
      <p className="mt-1 text-sm text-text-muted">
        Share something you&apos;ve built with the NexApp community. An admin will
        review it before it goes live. Track the status on your{" "}
        <Link href="/dashboard" className="underline underline-offset-4">
          developer dashboard
        </Link>
        .
      </p>

      <div className="mt-8">
        <SubmitAppForm categories={(categories as Category[]) ?? []} />
      </div>
    </div>
  );
}
