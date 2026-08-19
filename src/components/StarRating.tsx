"use client";

import { Star } from "lucide-react";

export default function StarRating({
  value,
  size = 16,
  interactive = false,
  onChange,
}: {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className={interactive ? "transition-transform hover:scale-110" : "cursor-default"}
          >
            <Star
              size={size}
              className={filled ? "fill-accent text-accent" : "fill-none text-text-muted"}
              strokeWidth={filled ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
