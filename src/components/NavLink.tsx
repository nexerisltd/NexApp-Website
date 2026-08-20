"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      className={`relative rounded-lg px-3 py-2 transition-colors ${
        active ? "text-text" : "text-text-muted hover:bg-surface-2 hover:text-text"
      } ${className}`}
    >
      {active && (
        // Loops forever (repeat: Infinity) for as long as this page stays
        // active — not a one-off transition, so the current nav item keeps
        // gently pulsing the whole time the person is on that page.
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-lg bg-accent/15 ring-1 ring-accent/30"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span className="relative font-medium">{children}</span>
    </Link>
  );
}
