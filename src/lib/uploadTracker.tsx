"use client";

import { createContext, useCallback, useContext, useState } from "react";

type TrackerValue = { busyCount: number; setBusy: (id: string, busy: boolean) => void };
const UploadTrackerContext = createContext<TrackerValue | null>(null);

// Uploads now happen client-side (for real progress bars) before the form
// is ever submitted, so there's a real race that didn't exist in the old
// server-side-upload flow: someone could hit Save while a file is still
// mid-upload. Every upload-capable field registers itself here while busy;
// SubmitButton reads the combined count and refuses to submit until it's
// zero.
export function UploadTrackerProvider({ children }: { children: React.ReactNode }) {
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const setBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return (
    <UploadTrackerContext.Provider value={{ busyCount: busyIds.size, setBusy }}>
      {children}
    </UploadTrackerContext.Provider>
  );
}

export function useUploadBusySetter(id: string) {
  const ctx = useContext(UploadTrackerContext);
  return useCallback((busy: boolean) => ctx?.setBusy(id, busy), [ctx, id]);
}

export function useAnyUploadBusy(): boolean {
  const ctx = useContext(UploadTrackerContext);
  return ctx ? ctx.busyCount > 0 : false;
}
