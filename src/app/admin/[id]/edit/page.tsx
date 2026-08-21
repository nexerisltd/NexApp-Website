import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppForm from "@/components/AppForm";
import AppIssueManager from "@/components/AppIssueManager";
import type { App, AppIssue, Category } from "@/lib/types";

export default async function EditAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: app }, { data: categories }, { data: activeIssue }] = await Promise.all([
    supabase.from("apps").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("app_issues")
      .select("*")
      .eq("app_id", id)
      .eq("active", true)
      .maybeSingle(),
  ]);

  if (!app) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Edit app</h1>
      <p className="mt-1 text-sm text-text-muted">{(app as App).name}</p>
      <div className="mt-6 max-w-xl">
        <AppIssueManager appId={id} activeIssue={activeIssue as AppIssue | null} />
      </div>
      <div className="mt-8 max-w-xl">
        <AppForm app={app as App} categories={(categories as Category[]) ?? []} />
      </div>
    </div>
  );
}
