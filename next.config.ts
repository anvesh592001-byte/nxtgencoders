import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }] },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
