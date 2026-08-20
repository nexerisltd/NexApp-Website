"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Apps" },
  { href: "/admin/billboards", label: "Billboards" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/source", label: "Source" },
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "neu-pressed text-accent" : "glass-card text-text-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
