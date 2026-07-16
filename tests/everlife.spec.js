// @ts-check
import { test, expect } from '@playwright/test';

test('open Everlife staging page', async ({ page }) => {
  await page.goto('https://stagingapp.everlifemd.com/nad/v1');
  await expect(page).toHaveURL(/stagingapp\.everlifemd\.com\/nad\/v1/);
});
