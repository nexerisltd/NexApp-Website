"use client";

import { useRef, useState } from "react";
import { ImagePlus, Move } from "lucide-react";

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
  const dragState = useRef<{
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setPosition({ x: 50, y: 50 });
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!preview) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, startPos: position };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    // Dragging the photo itself (Facebook-style): moving the pointer right
    // reveals more of the image's left side, so object-position x moves the
    // opposite way of the drag.
    const nextX = dragState.current.startPos.x - (dx / rect.width) * 100;
    const nextY = dragState.current.startPos.y - (dy / rect.height) * 100;
    setPosition({
      x: Math.min(100, Math.max(0, Math.round(nextX))),
      y: Math.min(100, Math.max(0, Math.round(nextY))),
    });
  }

  function handlePointerUp() {
    dragState.current = null;
    setDragging(false);
  }

  const positionValue = `${position.x}% ${position.y}%`;

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="existing_cover_url" value={existingUrl ?? ""} />
      <input type="hidden" name="cover_position" value={positionValue} />

      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`glass-card aurora-border relative flex aspect-[21/9] w-full max-w-md touch-none select-none items-center justify-center overflow-hidden rounded-xl ${
          preview ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              draggable={false}
              style={{ objectPosition: positionValue }}
              className="h-full w-full object-cover"
            />
            {!dragging && (
              <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white">
                <Move size={11} /> Drag to reposition
              </div>
            )}
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

      {preview && (position.x !== 50 || position.y !== 50) && (
        <button
          type="button"
          onClick={() => setPosition({ x: 50, y: 50 })}
          className="self-start rounded-full bg-surface-2 px-2.5 py-1 text-xs text-text-muted hover:text-text"
        >
          Reset to center
        </button>
      )}

      <p className="text-xs text-text-muted">
        Recommended size <strong>1680&times;720px</strong> (21:9 ratio) — this is the same
        ratio as the homepage hero billboard, so it&apos;s used as-is when this app is
        featured there. Drag the photo above to choose what stays in frame.
      </p>
    </div>
  );
}
