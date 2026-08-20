import { createClient } from "@/lib/supabase/server";
import BillboardForm from "@/components/BillboardForm";

export default async function NewBillboardPage() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("apps")
    .select("id, name, icon_url, app_code")
    .order("name");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Add New Billboard</h1>
      <p className="mt-1 text-sm text-text-muted">
        Give it a title, pick the app it features, and optionally add an offer badge.
      </p>
      <div className="mt-8 max-w-xl">
        <BillboardForm apps={apps ?? []} />
      </div>
    </div>
  );
}
