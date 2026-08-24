import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Home, LayoutGrid, Download, Bell, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SidebarNavList, { type SidebarNavItem } from "@/components/SidebarNavList";
import SidebarInstallCard from "@/components/SidebarInstallCard";

// Suspense fallback for SidebarNavList (which reads useSearchParams and so
// must be wrapped in Suspense) — same links, no active-highlight logic, so
// there's no layout shift while the client bundle for the real version loads.
function StaticNavFallback({ items }: { items: SidebarNavItem[] }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted"
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.dot && <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />}
          {!!item.badge && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export default async function Sidebar() {
  // Everything here is best-effort personalization — if any of it fails
  // for any reason, the sidebar should still render with sensible
  // defaults rather than taking the entire site down.
  let hasNewUpdate = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const results = await Promise.allSettled([
        supabase.rpc("get_my_app_updates"),
        supabase.from("profiles").select("updates_last_seen_at").eq("id", user.id).single(),
      ]);
      const [updatesResult, profileResult] = results;

      if (updatesResult.status === "fulfilled" && updatesResult.value.data) {
        const updates = updatesResult.value.data as { version_updated_at: string }[];
        const lastSeen =
          profileResult.status === "fulfilled"
            ? profileResult.value.data?.updates_last_seen_at
            : null;
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        hasNewUpdate = updates.some(
          (u) => new Date(u.version_updated_at).getTime() > lastSeenTime
        );
      }
    }
  } catch (err) {
    console.error("[Sidebar] personalization fetch failed, rendering defaults:", err);
  }

  const navItems: SidebarNavItem[] = [
    { href: "/", label: "Home", icon: <Home size={17} /> },
    { href: "/shop", label: "Apps", icon: <LayoutGrid size={17} /> },
    { href: "/downloads", label: "My Apps", icon: <Download size={17} /> },
    { href: "/updates", label: "Updates", icon: <Bell size={17} />, dot: hasNewUpdate },
    { href: "/favorites", label: "Wishlist", icon: <Heart size={17} /> },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-5 lg:flex">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/icon-512.png"
          alt="NexApp"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-accent/20"
        />
        <span>
          <span className="block font-display text-lg font-bold leading-tight">
            Nex<span className="aurora-text">App</span>
          </span>
          <span className="block text-[11px] leading-tight text-text-muted">
            Discover &middot; Download &middot; Enjoy
          </span>
        </span>
      </Link>

      <div className="mt-6">
        <Suspense fallback={<StaticNavFallback items={navItems} />}>
          <SidebarNavList items={navItems} />
        </Suspense>
      </div>

      <div className="flex-1" />

      <SidebarInstallCard />

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-[11px] text-text-muted">
        <p>&copy; {new Date().getFullYear()} NexApp</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-text">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text">
            Terms
          </Link>
          <Link href="/apply-dev" className="hover:text-text">
            Become a Developer
          </Link>
        </div>
      </div>
    </aside>
  );
}
