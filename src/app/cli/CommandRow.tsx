"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CommandRow({ cmd, desc }: { cmd: string; desc: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <code className="w-fit shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 font-mono text-sm text-neutral-800 sm:w-[21rem]">
          {cmd}
        </code>
        <span className="text-sm text-neutral-500">{desc}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy command"
        className="shrink-0 self-start rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 sm:self-center"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
