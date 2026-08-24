"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, CheckCircle2 } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function SidebarInstallCard() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as the installed PWA — no point offering to install.
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone
    ) {
      setInstalled(true);
    }

    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstallEvent(null);
      setInstalled(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-accent to-[#6d5ce8] p-5 text-white shadow-lg shadow-accent/20">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
        <Image src="/icon-32.png" alt="" width={18} height={18} />
      </div>
      <p className="font-display text-base font-bold leading-snug">
        {installed ? "NexApp is installed" : "Install NexApp"}
      </p>
      <p className="text-xs leading-relaxed text-white/80">
        {installed
          ? "You're all set — open it anytime from your home screen or desktop."
          : "Get the app-like experience — installs in one tap, works offline."}
      </p>
      {installed ? (
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold">
          <CheckCircle2 size={13} /> Installed
        </span>
      ) : installEvent ? (
        <button
          onClick={handleInstall}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-accent transition-transform hover:scale-[1.03]"
        >
          <Download size={13} />
          Install
        </button>
      ) : (
        <p className="text-[11px] text-white/70">
          Open this site in Chrome/Edge on desktop or Android, or use &quot;Add to
          Home Screen&quot; on iOS Safari.
        </p>
      )}
    </div>
  );
}
