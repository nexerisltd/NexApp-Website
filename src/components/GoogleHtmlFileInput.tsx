"use client";

import { useState } from "react";
import { FileCheck2 } from "lucide-react";

export default function GoogleHtmlFileInput({
  existingFilename,
  existingContent,
}: {
  existingFilename?: string | null;
  existingContent?: string | null;
}) {
  const [filename, setFilename] = useState(existingFilename ?? "");
  const [content, setContent] = useState(existingContent ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^google[a-f0-9]+\.html$/i.test(file.name)) {
      setError("That doesn't look like the file Google gave you — the name should look like googleXXXXXXXX.html.");
      return;
    }
    setError(null);
    setFilename(file.name);
    setContent(await file.text());
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="google_html_verification_filename" value={filename} />
      <input type="hidden" name="google_html_verification_content" value={content} />
      <input
        type="file"
        accept=".html"
        onChange={handleChange}
        className="aurora-border glass-card w-full max-w-sm rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
      />
      {filename && (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <FileCheck2 size={12} /> {filename} — will be served at /{filename}
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
