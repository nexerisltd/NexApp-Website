"use client";

import { useState, useRef } from "react";
import { ImagePlus, Crosshair } from "lucide-react";

function parsePosition(value: string): { x: number; y: number } {
  const match = value.match(/^([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return { x: 50, y: 50 };
  return { x: Number(match[1]), y: Number(match[2]) };
}

export default function CoverFileInput({
  existingUrl,
  existingPosition,
}: {
  existingUrl?: string | null;
  existingPosition?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [position, setPosition] = useState(() =>
    parsePosition(existingPosition ?? "50% 50%")
  );
  const frameRef = useRef<HTMLDivElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setPosition({ x: 50, y: 50 });
    }
  }

  function handlePick(e: React.MouseEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setPosition({ x: Math.round(x), y: Math.round(y) });
  }

  const positionValue = `${position.x}% ${position.y}%`;

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="existing_cover_url" value={existingUrl ?? ""} />
      <input type="hidden" name="cover_position" value={positionValue} />

      <div
        ref={frameRef}
        onClick={preview ? handlePick : undefined}
        className={`glass-card aurora-border relative flex aspect-[21/9] w-full max-w-md items-center justify-center overflow-hidden rounded-xl ${
          preview ? "cursor-crosshair" : ""
        }`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              style={{ objectPosition: positionValue }}
              className="h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <Crosshair size={20} className="absolute inset-0 m-auto text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-text-muted">
            <ImagePlus size={20} />
            <span className="text-xs">21:9 cover preview</span>
          </div>
        )}
      </div>

      <input
        type="file"
        name="cover_file"
        accept="image/png,image/jpeg"
        onChange={handleChange}
        className="aurora-border glass-card w-full max-w-md rounded-xl px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:text-text"
      />

      {preview && (
        <div className="flex items-center gap-3">
          <p className="text-xs text-text-muted">
            Click anywhere on the preview to keep that part of the image in frame.
          </p>
          {(position.x !== 50 || position.y !== 50) && (
            <button
              type="button"
              onClick={() => setPosition({ x: 50, y: 50 })}
              className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-text-muted hover:text-text"
            >
              Reset to center
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-text-muted">
        Recommended size <strong>1680&times;720px</strong> (21:9 ratio) — this is the same
        ratio as the homepage hero billboard, so it&apos;s used as-is when this app is
        featured there.
      </p>
    </div>
  );
}
