"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Monitor, Smartphone, Globe, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { PlatformGroup, PlatformLink } from "@/lib/types";

const GROUP_META: Record<PlatformGroup, { label: string; icon: typeof Monitor }> = {
  desktop: { label: "Desktop", icon: Monitor },
  mobile: { label: "Mobile", icon: Smartphone },
  web: { label: "Web", icon: Globe },
  other: { label: "Other", icon: Globe },
};

export default function DownloadButton({
  appId,
  links,
}: {
  appId: string;
  links: PlatformLink[];
}) {
  const [open, setOpen] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);

  async function handleSelect(link: PlatformLink) {
    setLoadingLabel(link.label);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("downloads").insert({
      app_id: appId,
      user_id: user?.id ?? null,
      platform_label: link.label,
    });

    setLoadingLabel(null);
    setOpen(false);
    window.open(link.url, "_blank", "noopener,noreferrer");
    toast(`Download started — ${link.label}`, "success");
  }

  // Single download link — skip the picker and go straight there.
  if (links.length <= 1) {
    const only = links[0];
    return (
      <button
        onClick={() => only && handleSelect(only)}
        disabled={!only || loadingLabel !== null}
        className="flex items-center gap-2 rounded-full bg-text px-6 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {loadingLabel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        Download
      </button>
    );
  }

  const grouped = links.reduce<Record<string, PlatformLink[]>>((acc, link) => {
    (acc[link.group] ??= []).push(link);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-text px-6 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
      >
        <Download size={16} />
        Download
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong aurora-border w-full max-w-sm rounded-3xl p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Choose your platform</h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {(Object.keys(grouped) as PlatformGroup[]).map((group) => {
                  const meta = GROUP_META[group] ?? GROUP_META.other;
                  const GroupIcon = meta.icon;
                  return (
                    <div key={group}>
                      <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-text-muted">
                        <GroupIcon size={12} /> {meta.label}
                      </p>
                      <div className="flex flex-col gap-2">
                        {grouped[group].map((link) => (
                          <button
                            key={link.label}
                            onClick={() => handleSelect(link)}
                            disabled={loadingLabel !== null}
                            className="glass-card aurora-border flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.01] disabled:opacity-60"
                          >
                            {link.label}
                            {loadingLabel === link.label ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} className="text-text-muted" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
