import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel only looks for the build in `.next`, so that stays the default.
  // Overridable so a second dev server (the booking-writes Playwright project)
  // can build into its own directory instead of fighting over this one.
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // The share cards read their fonts and photos from ./assets at build time.
  outputFileTracingIncludes: {
    '/programs/[slug]/opengraph-image': ['./assets/og-fonts/**', './assets/og-photos/**'],
  },

  // Programme pages used to live at /programs/<backend id>. Links already
  // shared on WhatsApp keep working.
  async redirects() {
    return [
      { source: '/programs/football_academy', destination: '/programs/football-academy', permanent: true },
      { source: '/programs/chess', destination: '/programs/chess-club', permanent: true },
      { source: '/programs/community_yoga', destination: '/programs/community-yoga', permanent: true },
      { source: '/programs/holiday_training', destination: '/programs/holiday-training', permanent: true },
      { source: '/programs/individual_training', destination: '/programs/individual-training', permanent: true },
      { source: '/programs/yoga', destination: '/programs/community-yoga', permanent: true },
      { source: '/programs/holiday', destination: '/programs/holiday-training', permanent: true },
      { source: '/whatson', destination: '/whats-on', permanent: true },
    ];
  },
};

export default nextConfig;
