"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, Shield } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import LogoutButton from "@/components/LogoutButton";

export default function UserMenu({ user, isAdmin }: { user: User; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Account";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => setMounted(true), []);

  function openMenu() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        btnRef.current &&
        !btnRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (open && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="glass-card aurora-border flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xs">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        {name}
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ position: "fixed", top: coords.top, right: coords.right }}
                className="glass-strong aurora-border z-[999] flex w-48 flex-col gap-1 rounded-2xl p-1.5"
              >
                <Link
                  href="/downloads"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                >
                  <LayoutDashboard size={14} className="text-text-muted" /> My Downloads
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
                  >
                    <Shield size={14} className="text-text-muted" /> Admin
                  </Link>
                )}
                <div className="mt-1 border-t border-border px-3 py-2">
                  <LogoutButton />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}