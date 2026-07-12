import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the Turbopack root to the current project directory to avoid home directory lockfile conflicts
    root: __dirname,
  },
};

export default nextConfig;
