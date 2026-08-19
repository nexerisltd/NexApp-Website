"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

type FavoritesContextValue = {
  userId: string | null;
  isFavorited: (appId: string) => boolean;
  toggleFavorite: (appId: string) => Promise<{ error: string | null }>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadFavorites(uid: string) {
      const { data } = await supabase.from("favorites").select("app_id").eq("user_id", uid);
      if (mounted) setFavoritedIds(new Set((data ?? []).map((f) => f.app_id)));
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      if (data.user) loadFavorites(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        loadFavorites(uid);
      } else {
        setFavoritedIds(new Set());
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isFavorited = useCallback((appId: string) => favoritedIds.has(appId), [favoritedIds]);

  const toggleFavorite = useCallback(
    async (appId: string) => {
      if (!userId) {
        return { error: "Sign in to save apps to your favorites" };
      }
      const supabase = createClient();
      const alreadyFavorited = favoritedIds.has(appId);

      if (alreadyFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("app_id", appId)
          .eq("user_id", userId);
        if (error) return { error: error.message };
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          next.delete(appId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ app_id: appId, user_id: userId });
        if (error) return { error: error.message };
        setFavoritedIds((prev) => new Set(prev).add(appId));
      }
      return { error: null };
    },
    [userId, favoritedIds]
  );

  const value = useMemo(
    () => ({ userId, isFavorited, toggleFavorite }),
    [userId, isFavorited, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
