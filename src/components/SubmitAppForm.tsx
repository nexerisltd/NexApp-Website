import { submitApp } from "@/app/submit/actions";
import PlatformLinksEditor from "@/components/PlatformLinksEditor";
import IconFileInput from "@/components/IconFileInput";
import CoverFileInput from "@/components/CoverFileInput";
import ScreenshotsFileInput from "@/components/ScreenshotsFileInput";
import type { Category } from "@/lib/types";

export default function SubmitAppForm({ categories }: { categories: Category[] }) {
  return (
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

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          App icon (PNG/JPEG)
        </label>
        <IconFileInput />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          App cover (PNG/JPEG)
        </label>
        <CoverFileInput />
        <p className="mt-1.5 text-xs text-text-muted">
          If your app gets featured on the homepage, this image becomes its billboard
          background — an admin picks which apps get featured.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          Screenshots (PNG/JPEG, multiple allowed)
        </label>
        <ScreenshotsFileInput existing={[]} />
      </div>

      <p className="text-xs text-text-muted">
        Your app will be reviewed by a NexApp admin before it appears in the store.
      </p>

      <button
        type="submit"
        className="mt-1 self-start rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.02]"
      >
        Submit for review
      </button>
    </form>
  );
}
