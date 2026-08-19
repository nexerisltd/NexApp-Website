import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NexApp — Your app store, everywhere",
    short_name: "NexApp",
    description:
      "Discover, publish and download apps in one place — a web-based app store from NexAuras.",
    start_url: "/",
    display: "standalone",
    background_color: "#2a2e38",
    theme_color: "#2a2e38",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
