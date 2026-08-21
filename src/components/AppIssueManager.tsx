"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { postAppIssue, resolveAppIssue } from "@/app/admin/issues/actions";
import type { AppIssue } from "@/lib/types";

export default function AppIssueManager({
  appId,
  activeIssue,
}: {
  appId: string;
  activeIssue: AppIssue | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (activeIssue && !open) {
    return (
      <div className="glass-card rounded-xl border border-danger/40 bg-danger/5 p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text">{activeIssue.title}</p>
            {activeIssue.description && (
              <p className="mt-1 text-xs text-text-muted">{activeIssue.description}</p>
            )}
            {activeIssue.download_blocked && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
                <Ban size={11} /> Downloads are blocked while this is active
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="glass-strong aurora-border rounded-full px-3 py-1.5 text-xs font-medium"
          >
            Edit
          </button>
          <form
            action={async (fd) => {
              await resolveAppIssue(fd);
              router.refresh();
            }}
          >
            <input type="hidden" name="id" value={activeIssue.id} />
            <input type="hidden" name="app_id" value={appId} />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success"
            >
              <CheckCircle2 size={12} /> Mark resolved
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card aurora-border rounded-xl p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-mono text-text-muted">
        <AlertTriangle size={13} /> Post an issue
      </p>
      <p className="mb-3 text-xs text-text-muted">
        This shows instantly as a banner on the app&apos;s public page.
      </p>
      <form
        action={async (fd) => {
          await postAppIssue(fd);
          setOpen(false);
          router.refresh();
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="app_id" value={appId} />
        <input
          name="title"
          required
          placeholder="Issue title, e.g. Login broken on latest update"
          defaultValue={activeIssue?.title}
          className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
        />
        <textarea
          name="description"
          rows={3}
          placeholder="What's going on, and what should users expect?"
          defaultValue={activeIssue?.description ?? ""}
          className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
        />
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="download_blocked"
            defaultChecked={activeIssue?.download_blocked}
            className="h-4 w-4 accent-danger"
          />
          Block downloads while this issue is active
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full neu-raised px-5 py-2 text-sm font-medium text-danger"
          >
            Post issue
          </button>
          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 text-sm text-text-muted"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
