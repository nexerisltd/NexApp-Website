"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failing (e.g. unsupported browser, dev sandbox) is
        // non-fatal — the site works fine without offline support.
      });
    }
  }, []);

  return null;
}
