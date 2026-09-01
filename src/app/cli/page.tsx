import type { Metadata } from "next";
import { CodeBlock } from "./CodeBlock";
import { CommandRow } from "./CommandRow";

export const metadata: Metadata = {
  title: "NexApp CLI — Install apps from your terminal",
  description:
    "Search, inspect, and install NexApp store apps and games straight from the command line.",
};

const commands: { cmd: string; desc: string }[] = [
  { cmd: "nexapp search <query>", desc: "Search apps by name" },
  { cmd: "nexapp list", desc: "List every published app" },
  {
    cmd: "nexapp info <slug-or-app-id>",
    desc: "Show version, description, and available platforms",
  },
  {
    cmd: "nexapp install <slug-or-app-id>",
    desc: "Download and install — auto-detects your OS",
  },
  {
    cmd: 'nexapp install <slug> -p "APK"',
    desc: "Force a specific platform by label",
  },
  {
    cmd: "nexapp install <slug> --download-only",
    desc: "Download without launching the installer",
  },
  {
    cmd: "nexapp config --api-url <url>",
    desc: "Point the CLI at a different NexApp deployment",
  },
];

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function SmartphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}>
      {children}
    </span>
  );
}

export default function CliPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      {/* Hero */}
      <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
        <div>
          <span className="inline-flex w-fit items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
            Developer tools
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Nex
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              App
            </span>{" "}
            CLI
          </h1>
          <p className="mt-4 max-w-md text-lg text-neutral-600">
            Install any app or game from the NexApp store without leaving
            your terminal — search, inspect, and download in one line.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-indigo-200 via-violet-200 to-fuchsia-200 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="space-y-2 p-5 font-mono text-sm">
              <p className="text-neutral-500">$ nexapp install nexmusic</p>
              <p className="text-emerald-400">✓ Downloaded to ~/Downloads/NexApp</p>
              <p className="text-neutral-500">Launching installer...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Install + Quick start */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <IconChip className="bg-blue-50 text-blue-600">
              <DownloadIcon />
            </IconChip>
            <h2 className="text-lg font-semibold text-neutral-900">Install</h2>
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            Clone the CLI, then link it globally:
          </p>
          <div className="mt-3">
            <CodeBlock
              code={`git clone https://github.com/nexerisltd/nexapp-cli
cd nexapp-cli
npm install
npm install -g .`}
            />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Works on Windows, macOS, and Linux. Requires Node.js 18 or newer.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <IconChip className="bg-violet-50 text-violet-600">
              <BoltIcon />
            </IconChip>
            <h2 className="text-lg font-semibold text-neutral-900">Quick start</h2>
          </div>
          <div className="mt-3">
            <CodeBlock
              code={`nexapp search music
nexapp info nexmusic
nexapp install nexmusic`}
            />
          </div>
        </section>
      </div>

      {/* Commands */}
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <IconChip className="bg-indigo-50 text-indigo-600">
            <TerminalIcon />
          </IconChip>
          <h2 className="text-lg font-semibold text-neutral-900">Commands</h2>
        </div>
        <div className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
          {commands.map((c) => (
            <CommandRow key={c.cmd} cmd={c.cmd} desc={c.desc} />
          ))}
        </div>
      </section>

      {/* Choosing a platform + Where files go */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <IconChip className="bg-violet-50 text-violet-600">
              <SmartphoneIcon />
            </IconChip>
            <h2 className="text-lg font-semibold text-neutral-900">
              Choosing a platform
            </h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            When an app ships more than one build, running{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px]">
              nexapp install
            </code>{" "}
            shows a numbered list you can navigate with the arrow keys — no
            need to remember exact platform names. Pass{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px]">
              -p
            </code>{" "}
            to skip the prompt when you already know what you want.
          </p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <IconChip className="bg-blue-50 text-blue-600">
              <FolderIcon />
            </IconChip>
            <h2 className="text-lg font-semibold text-neutral-900">
              Where files go
            </h2>
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            Downloads save to{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px]">
              ~/Downloads/NexApp
            </code>{" "}
            by default. Change it anytime with:
          </p>
          <div className="mt-3">
            <CodeBlock code={`nexapp config --install-dir "/path/you/want"`} />
          </div>
        </section>
      </div>
    </main>
  );
}
