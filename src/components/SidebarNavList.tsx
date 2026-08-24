"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export type SidebarNavItem = {
  href: string;
  label: string;
  // Already-rendered JSX (e.g. <Home size={17} />), not the icon component
  // itself — passing a raw component/function reference as a prop from a
  // Server Component to a "use client" component isn't serializable across
  // the RSC boundary and breaks the build. A rendered element is just a
  // plain descriptor object, so it serializes fine.
  icon: React.ReactNode;
  badge?: number;
};

function isActivePath(pathname: string, search: string, href: string) {
  const [hrefPath, hrefQuery] = href.split("?");
  if (hrefPath === "/") return pathname === "/";
  if (pathname !== hrefPath) return false;
  // Distinguish e.g. /shop?sort=top from plain /shop so only the matching
  // sidebar item lights up instead of every /shop-based link at once.
  if (!hrefQuery) return !search;
  return search === `?${hrefQuery}`;
}

export default function SidebarNavList({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActivePath(pathname, search, item.href);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "text-accent" : "text-text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            {active && (
              <motion.span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-xl bg-accent/12 ring-1 ring-accent/25"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {item.icon}
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
