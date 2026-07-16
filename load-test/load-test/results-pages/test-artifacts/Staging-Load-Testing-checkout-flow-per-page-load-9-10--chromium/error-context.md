# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Staging-Load-Testing.spec.js >> checkout flow per-page (load 9/10)
- Location: tests\Staging-Load-Testing.spec.js:350:7

# Error details

```
Error: Flow did not complete within 3 attempts (repeatedly hit the gender-gate modal bug)

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link [ref=e7] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
    - main [ref=e13]:
      - generic [ref=e14]:
        - heading "Processing..." [level=3] [ref=e16]
        - generic [ref=e22]: START YOUR FREE VISIT
        - generic [ref=e23]:
          - heading "Get Started" [level=1] [ref=e24]
          - paragraph [ref=e25]: Tell us a bit about your health and lifestyle—it's quick, easy, and helps our medical team assess your treatment options.
          - paragraph [ref=e26]: Create account or login
          - generic [ref=e27]:
            - textbox "Enter Email Address" [ref=e28]: testae347_codeclouds@everlifemd.test
            - button "Processing..." [disabled]
          - generic [ref=e29]:
            - img "HIPAA Compliant" [ref=e31]
            - img "Money Back Guarantee" [ref=e33]
          - region "Notifications Alt+T"
    - contentinfo [ref=e34]:
      - generic [ref=e35]:
        - paragraph [ref=e36]: © 2025 by EverLife – All rights reserved.
        - paragraph [ref=e37]:
          - link "Contact Us" [ref=e38] [cursor=pointer]:
            - /url: /nad/v1/account#
          - text: "|"
          - link "Terms of Use" [ref=e39] [cursor=pointer]:
            - /url: /nad/v1/account#
          - text: "|"
          - link "Privacy Policy" [ref=e40] [cursor=pointer]:
            - /url: https://privacy.cptn.co/privacy-policy/636d61ac-192f-4dc3-a5fd-89e991415c4b
        - img "LegitScript" [ref=e41]
  - alert [ref=e42]: Everlife
```

# Test source

```ts
  241 | 
  242 |       await page.getByPlaceholder('Add discount code').fill('90manojit');
  243 |       await page.getByRole('button', { name: 'APPLY DISCOUNT CODE' }).click();
  244 |       // Give the discount request a moment to resolve (updates the order
  245 |       // summary / shows a success or error toast) before submitting.
  246 |       await page.waitForTimeout(2000);
  247 | 
  248 |       await page.getByRole('button', { name: 'COMPLETE YOUR SECURE PURCHASE' }).click();
  249 | 
  250 |       const reachedPostCheckout = await page
  251 |         .waitForURL((url) => !url.pathname.includes('checkout'), { timeout: 30000 })
  252 |         .then(() => true)
  253 |         .catch(() => false);
  254 |       if (!reachedPostCheckout) return false;
  255 | 
  256 |       return page
  257 |         .waitForURL(/upload-id/, { timeout: 20000 })
  258 |         .then(() => true)
  259 |         .catch(() => false);
  260 |     });
  261 |     if (!reachedUploadId) continue;
  262 | 
  263 |     const reachedCreatePassword = await test.step('6. Upload ID', async () => {
  264 |       // Capture a photo via the browser's (fake, in test runs) camera
  265 |       // rather than uploading a file from disk.
  266 |       const useMyCameraButton = page.locator('button.bg-blue-950');
  267 |       await page.getByRole('button', { name: /choose a file or take a photo/i }).click();
  268 |       let modalOpened = await useMyCameraButton.isVisible({ timeout: 8000 }).catch(() => false);
  269 |       if (!modalOpened) {
  270 |         // The modal occasionally doesn't open on the first click on this
  271 |         // flaky staging site; retry once before giving up on this attempt.
  272 |         await page
  273 |           .getByRole('button', { name: /choose a file or take a photo/i })
  274 |           .click({ timeout: 5000 })
  275 |           .catch(() => {});
  276 |         modalOpened = await useMyCameraButton.isVisible({ timeout: 8000 }).catch(() => false);
  277 |       }
  278 |       if (!modalOpened) return false;
  279 |       await useMyCameraButton.click(); // "Use My Camera"
  280 | 
  281 |       let capturedViaCamera = false;
  282 |       try {
  283 |         // Give the fake video stream a moment to actually start before
  284 |         // capturing — otherwise the capture can grab an empty/blank frame
  285 |         // and the UI silently stays on the live-preview view instead of
  286 |         // advancing to the Retake/Save screen.
  287 |         await expect(page.locator('video')).toBeVisible({ timeout: 10000 });
  288 |         await page.waitForTimeout(1500);
  289 |         await page.locator('button.bg-cyan-400').click(); // "Capture Photo"
  290 | 
  291 |         // Two buttons share this class at this point (Retake / Save); the
  292 |         // tooltip text is the only thing that tells them apart.
  293 |         const saveButton = page
  294 |           .locator('div.relative.group', { has: page.locator('span', { hasText: 'Save' }) })
  295 |           .locator('button');
  296 |         await expect(saveButton).toBeVisible({ timeout: 8000 });
  297 |         await saveButton.click();
  298 |         capturedViaCamera = true;
  299 |       } catch {
  300 |         // Some browsers (e.g. WebKit) don't have a reliable fake camera
  301 |         // device in test runs, so getUserMedia never produces a usable
  302 |         // frame. Fall back to uploading a photo file instead.
  303 |       }
  304 | 
  305 |       if (!capturedViaCamera) {
  306 |         await page.locator('button[data-modal-hide="default-modal"]').click().catch(() => {});
  307 |         await page.getByRole('button', { name: /choose a file or take a photo/i }).click();
  308 |         const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 });
  309 |         await page.locator('button.bg-cyan-400').click(); // "Upload"
  310 |         const fileChooser = await fileChooserPromise;
  311 | 
  312 |         const idPhotoPath = path.join(process.cwd(), 'fixtures', 'fake-id.png');
  313 |         await fileChooser.setFiles(idPhotoPath);
  314 |       }
  315 | 
  316 |       const submitIdButton = page.getByRole('button', { name: 'SUBMIT' });
  317 |       await expect(submitIdButton).toBeEnabled({ timeout: 10000 });
  318 |       await submitIdButton.click();
  319 | 
  320 |       return page
  321 |         .waitForURL(/create-password/, { timeout: 20000 })
  322 |         .then(() => true)
  323 |         .catch(() => false);
  324 |     });
  325 |     if (!reachedCreatePassword) continue;
  326 | 
  327 |     const reachedDashboard = await test.step('7. Create Password', async () => {
  328 |       await page.locator('#password').fill('123456');
  329 |       await page.getByRole('button', { name: 'SUBMIT' }).click();
  330 | 
  331 |       return page
  332 |         .waitForURL(/dashboard/, { timeout: 20000 })
  333 |         .then(() => true)
  334 |         .catch(() => false);
  335 |     });
  336 |     if (!reachedDashboard) continue;
  337 | 
  338 |     completed = true;
  339 |   }
  340 | 
> 341 |   expect(completed, `Flow did not complete within ${MAX_ATTEMPTS} attempts (repeatedly hit the gender-gate modal bug)`).toBe(true);
      |                                                                                                                         ^ Error: Flow did not complete within 3 attempts (repeatedly hit the gender-gate modal bug)
  342 | }
  343 | 
  344 | // Number of concurrent end-to-end checkout runs. Defaults to 1 (normal
  345 | // single-run behaviour); set LOAD_COUNT to scale up for load testing, e.g.:
  346 | //   LOAD_COUNT=10 npx playwright test tests/recorded-copy.spec.js --workers=10
  347 | const LOAD_COUNT = parseInt(process.env.LOAD_COUNT || '1', 10);
  348 | 
  349 | for (let i = 1; i <= LOAD_COUNT; i++) {
  350 |   test(`checkout flow per-page (load ${i}/${LOAD_COUNT})`, async ({ page }) => {
  351 |     test.setTimeout(180000);
  352 |     await runCheckoutFlowPerPage(page);
  353 |   });
  354 | }
  355 | 
```