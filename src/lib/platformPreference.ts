"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlatformGroup } from "@/lib/types";

const STORAGE_KEY = "nexapp-platform-pref";
const EVENT_NAME = "nexapp:platform-pref-change";

export function getStoredPlatformPreference(): PlatformGroup | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === "desktop" || value === "mobile" || value === "web" || value === "other") {
    return value;
  }
  return null;
}

function setStoredPlatformPreference(group: PlatformGroup) {
  window.localStorage.setItem(STORAGE_KEY, group);
  window.dispatchEvent(new CustomEvent<PlatformGroup>(EVENT_NAME, { detail: group }));
}

/**
 * Site-wide "which platform am I on" preference (Desktop / Mobile / Web /
 * Other), kept in localStorage so it's remembered across apps and visits.
 * Any component that calls this hook stays in sync with any other one that
 * changes it, in the same tab, without a page reload.
 */
export function usePlatformPreference() {
  const [preference, setPreference] = useState<PlatformGroup | null>(null);

  useEffect(() => {
    setPreference(getStoredPlatformPreference());

    function handleChange(e: Event) {
      const detail = (e as CustomEvent<PlatformGroup>).detail;
      setPreference(detail);
    }
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setPreference(getStoredPlatformPreference());
    }

    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setAndPersist = useCallback((group: PlatformGroup) => {
    setStoredPlatformPreference(group);
    setPreference(group);
  }, []);

  return [preference, setAndPersist] as const;
}
