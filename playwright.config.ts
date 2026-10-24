import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Two dev servers run, because whether the site may write bookings is a
 * server-side decision (MVSA_BOOKING_WRITES_ENABLED):
 *
 *   :3000  writes off — the default posture today
 *   :3001  writes on  — exercises the hold-then-confirm path
 *
 * Neither server reaches the real backend: the specs mock this site's own
 * /api routes in the browser, so no token and no network access are needed.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files sequentially to prevent concurrent Next.js dev compiler thrashing */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on failure */
  retries: 1,
  /* Limit workers to 1 for dev server stability */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 180_000,
      // The live-hours specs fake the slots service, so the picker asks it.
      env: { NEXT_PUBLIC_LIVE_SLOTS: 'on' },
    },
    {
      command: 'npx next dev -p 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        NEXT_DIST_DIR: '.next_public_writes',
        MVSA_BOOKING_WRITES_ENABLED: 'true',
        // Deliberately unreachable: every backend call in these specs is
        // mocked at this site's own /api boundary.
        MVSA_API_BASE_URL: 'http://127.0.0.1:9',
        MVSA_API_TOKEN: 'playwright-placeholder-not-a-real-token',
        MVSA_API_TIMEOUT_MS: '1000',
      },
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
      testIgnore: /booking-writes\.spec\.ts/,
    },
    {
      name: 'booking-writes',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3001' },
      testMatch: /booking-writes\.spec\.ts/,
    },
  ],
});
