import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SavedToast from "@/components/SavedToast";
import AdminAppsList from "@/components/AdminAppsList";
import type { App } from "@/lib/types";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("apps")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <SavedToast saved={saved === "1"} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage apps</h1>
          <p className="mt-1 text-sm text-text-muted">
            Publish, edit, or remove listings. Select multiple to act on them at once.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full neu-raised px-5 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.03]"
        >
          + New app
        </Link>
      </div>

      <div className="mt-8">
        <AdminAppsList apps={(apps as App[]) ?? []} />
      </div>
    </div>
  );
}
