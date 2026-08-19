"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/profile/actions";

export default function ProfileEditForm({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, setPending] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <form
      action={updateProfile}
      onSubmit={() => setPending(true)}
      className="mt-8 flex flex-col gap-4"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
        Public developer profile
      </p>

      <div className="flex items-center gap-4">
        <div className="glass-card aurora-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-text-muted" />
          )}
        </div>
        <input type="hidden" name="existing_avatar_url" value={avatarUrl ?? ""} />
        <input
          type="file"
          name="avatar_file"
          accept="image/png,image/jpeg"
          onChange={handleAvatarChange}
          className="aurora-border glass-card min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
        />
      </div>

      <input
        type="text"
        name="full_name"
        defaultValue={fullName}
        placeholder="Your name (shown on your published apps)"
        maxLength={80}
        className="glass-card aurora-border w-full rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-text-muted"
      />

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 self-start rounded-full neu-raised px-5 py-2.5 text-xs font-medium text-accent transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending && <Loader2 size={13} className="animate-spin" />}
        Save profile
      </button>
    </form>
  );
}
