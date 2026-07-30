import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AddAccountButton from "@/components/AddAccountButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import FeedbackToast from "@/components/FeedbackToast";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string | undefined) ?? "Account";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-6 py-14">
      <FeedbackToast error={error} redirectTo="/profile" />

      <div className="neu-raised rounded-3xl p-8 text-center">
        <span className="neu-pressed mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">{name}</h1>
        <p className="mt-1 text-sm text-text-muted">{user.email}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
          Accounts
        </p>
        <AddAccountButton />

        <p className="mt-4 font-mono text-xs uppercase tracking-wide text-text-muted">
          Session
        </p>
        <div className="neu-raised flex items-center justify-between rounded-full px-5 py-2.5">
          <span className="text-sm text-text-muted">Signed in as {user.email}</span>
          <LogoutButton />
        </div>

        <p className="mt-4 font-mono text-xs uppercase tracking-wide text-text-muted">
          Danger zone
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
