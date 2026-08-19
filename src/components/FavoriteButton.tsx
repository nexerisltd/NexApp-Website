"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";
import { toast } from "@/lib/toast";

export default function FavoriteButton({
  appId,
  variant = "default",
}: {
  appId: string;
  // "default": full pill button with label (app detail page).
  // "icon": compact circular icon-only button (card overlay).
  variant?: "default" | "icon";
}) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(appId);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setPending(true);
    const { error } = await toggleFavorite(appId);
    setPending(false);

    if (error) {
      toast(error, "error");
    } else {
      toast(favorited ? "Removed from favorites" : "Added to favorites", "success");
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        disabled={pending}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="glass-card flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Heart
            size={14}
            className={favorited ? "fill-accent text-accent" : "text-text-muted"}
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="glass-card aurora-border flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-transform hover:scale-[1.03] disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Heart size={14} className={favorited ? "fill-accent text-accent" : ""} />
      )}
      {favorited ? "Favorited" : "Add to favorites"}
    </button>
  );
}
