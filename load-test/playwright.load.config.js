// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated config for load testing the checkout flow at scale (separate
 * from the main functional-test config/results, since this is meant to run
 * with LOAD_COUNT up to 1000 and produces its own JMeter-style report
 * instead of Playwright's per-test HTML report).
 *
 * Usage:
 *   LOAD_COUNT=10 npx playwright test --config=load-test/playwright.load.config.js --workers=10
 */
export default defineConfig({
  testDir: '.',
  testMatch: 'load-test.spec.js',
  outputDir: './load-test/results/test-artifacts',
  fullyParallel: true,
  // Load-test runs are throwaway by nature; don't fail the whole run just
  // because a couple of samples hit the site's known flakiness.
  retries: 0,
  reporter: [
    ['list'],
    ['./jmeter-reporter.js', { outputDir: './load-test/results' }],
  ],
  use: {
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['camera'],
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
      },
    },
  ],
});
