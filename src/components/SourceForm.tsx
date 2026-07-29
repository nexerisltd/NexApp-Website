import { saveSource } from "@/app/admin/source/actions";
import AppPicker from "@/components/AppPicker";
import type { Source } from "@/lib/types";

export default function SourceForm({
  source,
  apps,
}: {
  source?: Source;
  apps: { id: string; name: string; icon_url: string | null }[];
}) {
  return (
    <form action={saveSource} className="flex flex-col gap-5">
      {source && <input type="hidden" name="id" value={source.id} />}

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          App
        </label>
        <AppPicker apps={apps} initialAppId={source?.app_id} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-mono text-text-muted">
          GitHub repository link
        </label>
        <input
          name="github_url"
          type="url"
          required
          defaultValue={source?.github_url ?? ""}
          placeholder="https://github.com/username/repo"
          className="aurora-border glass-card w-full rounded-xl px-4 py-2.5 text-sm outline-none"
        />
      </div>

      <p className="text-xs italic text-text-muted">
        !! Your source link will be shown on that app&apos;s page !!
      </p>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-text px-6 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
      >
        {source ? "Save changes" : "Save"}
      </button>
    </form>
  );
}
