import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/help", destination: "/shared/help" },
      { source: "/settings", destination: "/shared/settings" },
    ];
  },
};

export default nextConfig;
