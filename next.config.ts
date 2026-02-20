import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript type checking during build to save RAM on Hostinger (no swap, ~8MB free)
  // Types are still checked locally via IDE and tsc
  typescript: {
    ignoreBuildErrors: true,
  },
  // Limit build parallelism to reduce peak memory usage
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
