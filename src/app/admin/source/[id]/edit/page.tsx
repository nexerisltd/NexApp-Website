import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SourceForm from "@/components/SourceForm";
import type { Source } from "@/lib/types";

export default async function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: source }, { data: apps }] = await Promise.all([
    supabase.from("sources").select("*").eq("id", id).single(),
    supabase.from("apps").select("id, name, icon_url, app_code").order("name"),
  ]);

  if (!source) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Edit source</h1>
      <div className="mt-8 max-w-xl">
        <SourceForm source={source as Source} apps={apps ?? []} />
      </div>
    </div>
  );
}
