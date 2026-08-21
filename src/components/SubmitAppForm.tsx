import { submitApp } from "@/app/submit/actions";
import PlatformLinksEditor from "@/components/PlatformLinksEditor";
import IconFileInput from "@/components/IconFileInput";
import CoverFileInput from "@/components/CoverFileInput";
import ScreenshotsFileInput from "@/components/ScreenshotsFileInput";
import SubmitButton from "@/components/SubmitButton";
import { UploadTrackerProvider } from "@/lib/uploadTracker";
import { GitBranch, ShieldCheck } from "lucide-react";
import type { Category } from "@/lib/types";

export default function SubmitAppForm({ categories }: { categories: Category[] }) {
  return (
    <UploadTrackerProvider>
      <form action={submitApp} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">Name</label>
          <input
            name="name"
            required
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">Tagline</label>
          <input
            name="tagline"
            placeholder="One short line describing your app"
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">Description</label>
          <textarea
            name="description"
            rows={5}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">Category</label>
            <select
              name="category_id"
              defaultValue=""
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">Version</label>
            <input
              name="version"
              defaultValue="1.0.0"
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Size label (optional)
          </label>
          <input
            name="size_label"
            placeholder="e.g. 24 MB"
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Default screenshot platform
          </label>
          <select
            name="default_platform"
            defaultValue="desktop"
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="web">Web</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Platforms & download links
          </label>
          <PlatformLinksEditor initialLinks={[]} />
        </div>

        <div className="glass-card aurora-border rounded-xl p-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-mono text-text-muted">
            <GitBranch size={13} /> Source code (GitHub repo link) — required
          </label>
          <input
            name="github_url"
            type="url"
            required
            placeholder="https://github.com/your-username/your-repo"
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />

          <label className="mt-3 flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="source_public"
              defaultChecked
              className="h-4 w-4 accent-accent"
            />
            Public your source? (show the link on your app&apos;s public page)
          </label>

          <div className="mt-3 flex gap-2 rounded-lg bg-surface-2 p-3 text-xs text-text-muted">
            <ShieldCheck size={26} className="shrink-0 text-accent" />
            <p>
              This is only used by our verified official reviewers to test your app before
              it goes live — it&apos;s how we make sure everything running through NexApp
              is safe for the people using it. Sharing your repo doesn&apos;t cause any
              problem for you: you&apos;re in full control of whether it&apos;s shown
              publicly on your app&apos;s page — leave &quot;Public your source?&quot;
              unchecked any time to keep it visible to our review team only.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            App icon (PNG/JPEG)
          </label>
          <IconFileInput uploadScope="submission" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            App cover (PNG/JPEG)
          </label>
          <CoverFileInput uploadScope="submission" />
          <p className="mt-1.5 text-xs text-text-muted">
            If your app gets featured on the homepage, this image becomes its billboard
            background — an admin picks which apps get featured.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Screenshots (PNG/JPEG, multiple allowed)
          </label>
          <ScreenshotsFileInput existing={[]} uploadScope="submission" />
        </div>

        <p className="text-xs text-text-muted">
          Your app will be reviewed by a NexApp admin before it appears in the store. By
          submitting, you agree to our{" "}
          <a href="/terms" target="_blank" className="text-accent underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" className="text-accent underline">
            Privacy Policy
          </a>
          .
        </p>

        <SubmitButton pendingLabel="Submitting…">Submit for review</SubmitButton>
      </form>
    </UploadTrackerProvider>
  );
}
