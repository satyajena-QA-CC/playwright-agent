// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Load-test config for the per-page breakdown variant
 * (tests/Staging-Load-Testing.spec.js). Same idea as
 * playwright.load.config.js, but points at the per-page spec and writes
 * its report to a separate results folder so the two don't overwrite
 * each other.
 *
 * Usage:
 *   $env:LOAD_COUNT = "10"
 *   npx playwright test --config=load-test/playwright.pages.config.js --workers=10
 */
export default defineConfig({
  testDir: '../tests',
  testMatch: 'Staging-Load-Testing.spec.js',
  outputDir: './load-test/results-pages/test-artifacts',
  fullyParallel: true,
  // Load-test runs are throwaway by nature; don't fail the whole run just
  // because a couple of samples hit the site's known flakiness.
  retries: 0,
  reporter: [
    ['list'],
    ['./jmeter-reporter.js', { outputDir: './load-test/results-pages' }],
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
