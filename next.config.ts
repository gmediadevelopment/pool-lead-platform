import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript type checking during build to save RAM on Hostinger
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build to save RAM on Hostinger (no swap, ~8MB free)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
