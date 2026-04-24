import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://umurava-be.up.railway.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
