import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }] },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
