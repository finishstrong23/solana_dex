import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "arweave.net" },
      { protocol: "https", hostname: "*.jito.network" },
      { protocol: "https", hostname: "static.jup.ag" },
      { protocol: "https", hostname: "*.nftstorage.link" },
    ],
  },
};

export default nextConfig;
