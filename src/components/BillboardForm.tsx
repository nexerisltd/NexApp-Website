import { saveBillboard } from "@/app/admin/billboards/actions";
import AppPicker from "@/components/AppPicker";
import type { Billboard } from "@/lib/types";

export default function BillboardForm({
  billboard,
  apps,
}: {
  billboard?: Billboard;
  apps: { id: string; name: string; icon_url: string | null; app_code: string }[];
}) {
  return (
    <form action={saveBillboard} className="flex flex-col gap-5">
      {billboard && <input type="hidden" name="id" value={billboard.id} />}

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          Title <span className="text-danger">*</span>
        </label>
        <input
          name="title"
          required
          defaultValue={billboard?.title}
          placeholder="e.g. The password vault built for teams"
          className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          App <span className="text-danger">*</span>
        </label>
        <AppPicker apps={apps} initialAppId={billboard?.app_id} />
        <p className="mt-1.5 text-xs text-text-muted">
          The app&apos;s icon floats over the billboard, its cover image is the
          background, and &quot;Learn more&quot; links to its page. Set the app&apos;s
          cover from its edit page if it doesn&apos;t have one yet.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          Offer (optional)
        </label>
        <input
          name="offer"
          defaultValue={billboard?.offer ?? ""}
          placeholder="e.g. Now free for life, Limited-time drop"
          className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Shown as a small badge above the title. Leave blank to hide it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">
            Display order
          </label>
          <input
            type="number"
            name="display_order"
            defaultValue={billboard?.display_order ?? 0}
            className="aurora-border w-full rounded-xl glass-card px-4 py-2.5 text-sm outline-none"
          />
          <p className="mt-1.5 text-xs text-text-muted">Lower numbers show first.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-mono text-text-muted">Status</label>
          <label className="aurora-border glass-card flex h-[42px] items-center gap-2.5 rounded-xl px-4 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={billboard?.active ?? true}
              className="h-4 w-4 accent-accent"
            />
            Active (visible on homepage)
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded-full neu-raised px-6 py-2.5 text-sm font-medium text-accent transition-transform hover:scale-[1.02]"
      >
        {billboard ? "Save changes" : "Create billboard"}
      </button>
    </form>
  );
}
