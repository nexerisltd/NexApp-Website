import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSubNav from "@/components/AdminSubNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin", { uid: user.id });

  if (!isAdmin) redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <AdminSubNav />
      {children}
    </div>
  );
}
