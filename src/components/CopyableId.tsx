"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/lib/toast";

export default function CopyableId({ id, label = "App ID" }: { id: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // Fallback for browsers/contexts without Clipboard API access
      const textarea = document.createElement("textarea");
      textarea.value = id;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    toast(`${label} copied`, "success");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="glass-card aurora-border flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs text-text-muted transition-transform hover:scale-[1.03]"
      aria-label={`Copy ${label}`}
      title={id}
    >
      {label}: {id.slice(0, 8)}…
      {copied ? (
        <Check size={12} className="text-success" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}
