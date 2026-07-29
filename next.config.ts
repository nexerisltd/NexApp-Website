import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  async redirects() {
    return [
      { source: "/apps", destination: "/shop", permanent: true },
      { source: "/apps/:slug", destination: "/shop/:slug", permanent: true },
      { source: "/dashboard", destination: "/downloads", permanent: true },
    ];
  },
};

export default nextConfig;
