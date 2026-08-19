"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function SidebarInstallCard() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstallEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent || dismissed) return null;

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
        <Image src="/icon-32.png" alt="" width={18} height={18} />
      </div>
      <p className="text-sm font-semibold">Install NexApp</p>
      <p className="mt-1 text-xs text-text-muted">
        Get the app-like experience — installs in one tap, works offline.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstall}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.03]"
        >
          <Download size={13} />
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-full px-3 py-2 text-xs text-text-muted hover:text-text"
        >
          Later
        </button>
      </div>
    </div>
  );
}
