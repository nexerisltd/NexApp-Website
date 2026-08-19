"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import GlobalSearch from "@/components/GlobalSearch";
import InstallAppButton from "@/components/InstallAppButton";
import NotificationBell from "@/components/NotificationBell";
import UserMenu from "@/components/UserMenu";
import LogoutButton from "@/components/LogoutButton";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Re-check the role on every navigation too (not just login/logout) so a
  // role change made directly in Supabase shows up without a fresh sign-in.
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let mounted = true;
    const supabase = createClient();
    supabase.rpc("is_admin", { uid: user.id }).then(({ data }) => {
      if (mounted) setIsAdmin(!!data);
    });
    return () => {
      mounted = false;
    };
  }, [user, pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <nav className="flex items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Image src="/icon-512.png" alt="NexApp" width={28} height={28} className="h-7 w-7" />
          Nex<span className="aurora-text">App</span>
        </Link>

        <div className="hidden items-center gap-1 text-sm text-text-muted sm:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 hover:text-text"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 hover:text-text"
          >
            Apps
          </Link>
          <Link
            href="/shop"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 hover:text-text"
          >
            Categories
          </Link>
          {!isAdmin && (
            <Link
              href="/submit"
              className="rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 hover:text-text"
            >
              Developers
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 hover:text-text"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden flex-1 justify-center px-6 lg:flex">
          <GlobalSearch variant="pill" />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden xl:block">
            <InstallAppButton />
          </div>
          <div className="lg:hidden">
            <GlobalSearch />
          </div>
          <NotificationBell userId={user?.id ?? null} />
          <ThemeToggle />

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <UserMenu user={user} isAdmin={isAdmin} />
            ) : (
              <>
                <Link
                  href="/downloads"
                  className="text-sm text-text-muted transition-colors hover:text-text"
                >
                  My Downloads
                </Link>
                <Link
                  href="/login"
                  className="aurora-border glass-card rounded-full px-4 py-1.5 text-sm font-medium"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-full sm:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border sm:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5 text-sm text-text-muted">
              <Link href="/" className="hover:text-text">
                Home
              </Link>
              <Link href="/shop" className="hover:text-text">
                Shop
              </Link>
              <Link href="/source" className="hover:text-text">
                Source
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hover:text-text">
                  Admin
                </Link>
              )}
              {user && (
                <Link href="/favorites" className="hover:text-text">
                  My Favorites
                </Link>
              )}
              {user && (
                <Link href="/downloads" className="hover:text-text">
                  My Downloads
                </Link>
              )}
              {user && !isAdmin && (
                <Link href="/submit" className="hover:text-text">
                  Submit an app
                </Link>
              )}
              {user && !isAdmin && (
                <Link href="/dashboard" className="hover:text-text">
                  Developer Dashboard
                </Link>
              )}
              {user ? (
                <LogoutButton />
              ) : (
                <>
                  <Link href="/login" className="hover:text-text">
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="aurora-border w-fit rounded-full bg-surface-2 px-4 py-1.5 font-medium text-text"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
