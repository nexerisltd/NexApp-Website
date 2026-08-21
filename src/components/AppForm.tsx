import { saveApp } from "@/app/admin/actions";
import PlatformLinksEditor from "@/components/PlatformLinksEditor";
import IconFileInput from "@/components/IconFileInput";
import CoverFileInput from "@/components/CoverFileInput";
import ScreenshotsFileInput from "@/components/ScreenshotsFileInput";
import SubmitButton from "@/components/SubmitButton";
import { UploadTrackerProvider } from "@/lib/uploadTracker";
import { GitBranch } from "lucide-react";
import type { App, Category } from "@/lib/types";

export default function AppForm({
  app,
  categories,
}: {
  app?: App;
  categories: Category[];
}) {
  return (
    <UploadTrackerProvider>
      <form action={saveApp} className="flex flex-col gap-5">
        {app && <input type="hidden" name="id" value={app.id} />}

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">Name</label>
          <input
            name="name"
            required
            defaultValue={app?.name}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            App ID (auto-generated, permanent)
          </label>
          <input
            disabled
            value={app?.app_code ?? "Assigned automatically once you save"}
            className="neu-pressed w-full rounded-xl px-4 py-2.5 text-sm text-text-muted outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">Tagline</label>
          <input
            name="tagline"
            defaultValue={app?.tagline ?? ""}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            defaultValue={app?.description ?? ""}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Category
            </label>
            <select
              name="category_id"
              defaultValue={app?.category_id ?? ""}
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
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Status
            </label>
            <select
              name="status"
              defaultValue={app?.status ?? "published"}
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Version
            </label>
            <input
              name="version"
              defaultValue={app?.version ?? "1.0.0"}
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-mono text-text-muted">
              Size label
            </label>
            <input
              name="size_label"
              placeholder="e.g. 24 MB"
              defaultValue={app?.size_label ?? ""}
              className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Default screenshot platform
          </label>
          <select
            name="default_platform"
            defaultValue={app?.default_platform ?? "desktop"}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="web">Web</option>
            <option value="other">Other</option>
          </select>
          <p className="mt-1 text-xs text-text-muted">
            Shown on the app page until a visitor picks a different platform themselves.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Platforms & download links
          </label>
          <PlatformLinksEditor initialLinks={app?.platform_links ?? []} />
        </div>

        <div className="glass-card aurora-border rounded-xl p-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-mono text-text-muted">
            <GitBranch size={13} /> Source code (GitHub repo link)
          </label>
          <input
            name="github_url"
            type="url"
            placeholder="https://github.com/org/repo"
            defaultValue={app?.github_url ?? ""}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
          <label className="mt-3 flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="source_public"
              defaultChecked={app?.source_public ?? true}
              className="h-4 w-4 accent-accent"
            />
            Public your source? (show the link on this app&apos;s public page)
          </label>
          <p className="mt-1.5 text-xs text-text-muted">
            Unchecked repos stay visible to the NexApp team only.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            App icon (PNG/JPEG)
          </label>
          <IconFileInput existingUrl={app?.icon_url} uploadScope="admin" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            App cover (PNG/JPEG)
          </label>
          <CoverFileInput
            existingUrl={app?.cover_url}
            existingPosition={app?.cover_position}
            uploadScope="admin"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Screenshots (PNG/JPEG, multiple allowed)
          </label>
          <ScreenshotsFileInput existing={app?.screenshots ?? []} uploadScope="admin" />
        </div>

        <SubmitButton>{app ? "Save changes" : "Create app"}</SubmitButton>
      </form>
    </UploadTrackerProvider>
  );
}
