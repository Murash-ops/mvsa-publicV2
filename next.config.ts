import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel only looks for the build in `.next`, so that stays the default.
  // Overridable so a second dev server (the booking-writes Playwright project)
  // can build into its own directory instead of fighting over this one.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
