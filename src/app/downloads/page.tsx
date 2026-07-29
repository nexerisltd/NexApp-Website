import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: downloads } = await supabase
    .from("downloads")
    .select("id, created_at, apps(name, slug, icon_url, version)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-2xl font-bold">Your downloads</h1>
      <p className="mt-1 text-sm text-text-muted">{user.email}</p>

      <div className="mt-8 flex flex-col divide-y divide-border border-y border-border">
        {downloads && downloads.length > 0 ? (
          downloads.map((d) => {
            const app = Array.isArray(d.apps) ? d.apps[0] : d.apps;
            if (!app) return null;
            return (
              <Link
                key={d.id}
                href={`/shop/${app.slug}`}
                className="flex items-center justify-between py-4 hover:bg-surface"
              >
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="font-mono text-xs text-text-muted">
                    v{app.version}
                  </p>
                </div>
                <p className="font-mono text-xs text-text-muted">
                  {new Date(d.created_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })
        ) : (
          <p className="py-10 text-center text-text-muted">
            You haven&apos;t downloaded anything yet.{" "}
            <Link href="/shop" className="underline underline-offset-4">
              Browse apps
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
