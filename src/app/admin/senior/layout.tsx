import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SeniorAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isSeniorAdmin } = await supabase.rpc("is_senior_admin", { uid: user.id });
  if (!isSeniorAdmin) redirect("/admin");

  return <div className="mt-8">{children}</div>;
}
