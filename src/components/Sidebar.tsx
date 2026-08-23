import Link from "next/link";
import { Suspense } from "react";
import {
  Home,
  LayoutGrid,
  BarChart3,
  Sparkles,
  Flame,
  Award,
  Download,
  Bell,
  Heart,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SidebarNavList, { type SidebarNavItem } from "@/components/SidebarNavList";

const PRIMARY_NAV: SidebarNavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Categories", icon: LayoutGrid },
  { href: "/shop?sort=top", label: "Top Charts", icon: BarChart3 },
  { href: "/shop?sort=new", label: "New Releases", icon: Sparkles },
  { href: "/shop?sort=trending", label: "Trending", icon: Flame },
  { href: "/shop?sort=editors", label: "Editor's Choice", icon: Award },
];

// Suspense fallback for SidebarNavList (which reads useSearchParams and so
// must be wrapped in Suspense) — same links, no active-highlight logic, so
// there's no layout shift while the client bundle for the real version loads.
function StaticNavFallback({ items }: { items: SidebarNavItem[] }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted"
          >
            <Icon size={17} />
            <span className="flex-1">{item.label}</span>
            {!!item.badge && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadCount = 0;
  let isVerifiedDev = false;
  let isAdmin = false;
  if (user) {
    const [{ count }, { data: profile }, { data: adminCheck }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
      supabase.from("profiles").select("dev_status").eq("id", user.id).single(),
      supabase.rpc("is_admin", { uid: user.id }),
    ]);
    unreadCount = count ?? 0;
    isVerifiedDev = profile?.dev_status === "verified";
    isAdmin = !!adminCheck;
  }

  const secondaryNav: SidebarNavItem[] = [
    { href: "/downloads", label: "My Apps", icon: Download },
    { href: "/", label: "Updates", icon: Bell, badge: unreadCount },
    { href: "/favorites", label: "Wishlist", icon: Heart },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-5 lg:flex">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#21c3e0] font-display text-lg font-extrabold text-white shadow-lg shadow-accent/20">
          N
        </span>
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
        <Suspense fallback={<StaticNavFallback items={PRIMARY_NAV} />}>
          <SidebarNavList items={PRIMARY_NAV} />
        </Suspense>
      </div>

      <div className="my-4 border-t border-border" />

      <Suspense fallback={<StaticNavFallback items={secondaryNav} />}>
        <SidebarNavList items={secondaryNav} />
      </Suspense>

      <div className="flex-1" />

      {!isAdmin && (
        <Link
          href={isVerifiedDev ? "/dashboard" : "/apply-dev"}
          className="group mt-6 flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-accent to-[#6d5ce8] p-5 text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
        >
          <p className="font-display text-base font-bold leading-snug">
            {isVerifiedDev ? "Developer Dashboard" : "Become a Developer"}
          </p>
          <p className="text-xs leading-relaxed text-white/80">
            {isVerifiedDev
              ? "Manage your apps and reach millions of users."
              : "Publish your app and reach millions of users."}
          </p>
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-accent transition-transform group-hover:translate-x-0.5">
            {isVerifiedDev ? "Open dashboard" : "Get Started"}
            <ArrowRight size={13} />
          </span>
        </Link>
      )}

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-[11px] text-text-muted">
        <p>&copy; {new Date().getFullYear()} NexApp</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-text">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text">
            Terms
          </Link>
          <Link href="/" className="hover:text-text">
            About
          </Link>
        </div>
      </div>
    </aside>
  );
}
