"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
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
      width="16"
      height="16"
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

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  return (
    <div className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <pre className="overflow-x-auto pr-8">
        <code className="whitespace-pre font-mono text-sm leading-6 text-neutral-800">
          {code}
        </code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
        className="absolute right-3 top-3 rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-500 transition hover:text-neutral-900"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
