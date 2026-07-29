import { createClient } from "@/lib/supabase/server";
import AppForm from "@/components/AppForm";
import type { Category } from "@/lib/types";

export default async function NewAppPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">New app</h1>
      <p className="mt-1 text-sm text-text-muted">
        Add a new listing to the store.
      </p>
      <div className="mt-8 max-w-xl">
        <AppForm categories={(categories as Category[]) ?? []} />
      </div>
    </div>
  );
}
