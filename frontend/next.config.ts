import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.246.169.123"],
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
