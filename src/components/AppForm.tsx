import { saveApp } from "@/app/admin/actions";
import PlatformLinksEditor from "@/components/PlatformLinksEditor";
import IconFileInput from "@/components/IconFileInput";
import ScreenshotsFileInput from "@/components/ScreenshotsFileInput";
import type { App, Category } from "@/lib/types";

export default function AppForm({
  app,
  categories,
}: {
  app?: App;
  categories: Category[];
}) {
  return (
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
          Platforms & download links
        </label>
        <PlatformLinksEditor initialLinks={app?.platform_links ?? []} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          App icon (PNG/JPEG)
        </label>
        <IconFileInput existingUrl={app?.icon_url} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          Screenshots (PNG/JPEG, multiple allowed)
        </label>
        <ScreenshotsFileInput existing={app?.screenshots ?? []} />
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.02]"
      >
        {app ? "Save changes" : "Create app"}
      </button>
    </form>
  );
}
