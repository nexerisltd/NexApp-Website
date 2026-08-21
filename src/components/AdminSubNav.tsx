"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  { href: "/admin", label: "Apps" },
  { href: "/admin/billboards", label: "Billboards" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/team", label: "Admins" },
];

export default function AdminSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex gap-2">
      {tabs.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "text-accent" : "glass-card text-text-muted"
            }`}
          >
            {active && (
              <motion.span
                aria-hidden
                layoutId="admin-nav-active"
                className="absolute inset-0 -z-10 rounded-full neu-pressed"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
