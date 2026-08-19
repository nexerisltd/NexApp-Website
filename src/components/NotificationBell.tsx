"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, PackageCheck, PackageX, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

const ICONS = {
  app_update: Sparkles,
  submission_approved: PackageCheck,
  submission_declined: PackageX,
};

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationBell({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    let active = true;
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (active && data) setNotifications(data as Notification[]);
      });
    return () => {
      active = false;
    };
  }, [userId]);

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

  async function toggleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((o) => !o);
  }

  async function markAllRead() {
    if (!userId || unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  }

  async function handleItemClick(n: Notification) {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      const supabase = createClient();
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    }
  }

  if (!userId) return null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
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
                className="glass-strong aurora-border z-[999] flex w-80 flex-col rounded-2xl p-2"
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-xs font-semibold">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] text-text-muted hover:text-accent"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-2 py-8 text-center text-xs text-text-muted">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((n) => {
                      const Icon = ICONS[n.type];
                      const content = (
                        <div
                          className={`flex items-start gap-2.5 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-2 ${
                            !n.read ? "bg-accent/5" : ""
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              n.type === "submission_declined"
                                ? "bg-danger/10 text-danger"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            <Icon size={14} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium leading-snug">
                              {n.title}
                            </span>
                            {n.body && (
                              <span className="mt-0.5 block text-[11px] text-text-muted">
                                {n.body}
                              </span>
                            )}
                            <span className="mt-1 block font-mono text-[10px] text-text-muted">
                              {relativeTime(n.created_at)}
                            </span>
                          </span>
                          {!n.read && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          )}
                        </div>
                      );
                      return n.link ? (
                        <Link key={n.id} href={n.link} onClick={() => handleItemClick(n)}>
                          {content}
                        </Link>
                      ) : (
                        <button
                          key={n.id}
                          onClick={() => handleItemClick(n)}
                          className="w-full"
                        >
                          {content}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
