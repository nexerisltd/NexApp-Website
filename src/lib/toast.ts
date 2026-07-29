export type ToastType = "success" | "error" | "info";

const STORAGE_KEY = "nexapp-pending-toast";

export function toast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;

  // Also stash it in sessionStorage so a toast fired right as a new page
  // mounts (e.g. immediately after a server-action redirect) isn't lost to
  // a race where this event fires before <Toaster/> has attached its
  // listener — Toaster checks sessionStorage on mount as a fallback.
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ message, type }));
  } catch {
    // sessionStorage unavailable — live event dispatch below still works
    // as long as Toaster is already mounted and listening.
  }

  window.dispatchEvent(
    new CustomEvent("nexapp-toast", { detail: { message, type } })
  );
}

export function takePendingToast(): { message: string; type: ToastType } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}