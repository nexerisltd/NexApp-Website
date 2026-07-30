import { createClient } from "@/lib/supabase/server";
import SourceForm from "@/components/SourceForm";

export default async function NewSourcePage() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("apps")
    .select("id, name, icon_url, app_code")
    .order("name");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Add New Source</h1>
      <p className="mt-1 text-sm text-text-muted">
        Select an app from the live app list or search by app ID, then link its
        GitHub repository.
      </p>
      <div className="mt-8 max-w-xl">
        <SourceForm apps={apps ?? []} />
      </div>
    </div>
  );
}
