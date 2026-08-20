import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillboardForm from "@/components/BillboardForm";
import type { Billboard } from "@/lib/types";

export default async function EditBillboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: billboard }, { data: apps }] = await Promise.all([
    supabase.from("billboards").select("*").eq("id", id).single(),
    supabase.from("apps").select("id, name, icon_url, app_code").order("name"),
  ]);

  if (!billboard) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Edit billboard</h1>
      <div className="mt-8 max-w-xl">
        <BillboardForm billboard={billboard as Billboard} apps={apps ?? []} />
      </div>
    </div>
  );
}
