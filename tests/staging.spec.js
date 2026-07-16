// @ts-check
import { test, expect } from '@playwright/test';

test('navigate to Everly staging URL', async ({ page }) => {
  const url = 'https://stagingapp.everlifemd.com/nad/v1';

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/stagingapp\.everlifemd\.com\/nad\/v1/);
});
