import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Persists a sequential counter across separate runs/instances (257, 258,
// 259, ...) so every checkout attempt gets a fresh, traceable email.
// Shares the same counter file as the other spec files, so numbering stays
// consistent across whichever one you run.
const EMAIL_COUNTER_FILE = path.join(process.cwd(), 'tests', '.email-counter.txt');
const EMAIL_COUNTER_LOCK = `${EMAIL_COUNTER_FILE}.lock`;

// Playwright workers are separate OS processes, so a plain read-then-write
// on the counter file is racy: two workers can read the same value before
// either writes back the increment, handing out a duplicate email.
// mkdirSync is atomic on every platform (fails with EEXIST if the
// directory already exists), so it doubles as a cheap cross-process mutex.
function withEmailCounterLock(fn) {
  const start = Date.now();
  const timeoutMs = 10000;
  while (true) {
    try {
      fs.mkdirSync(EMAIL_COUNTER_LOCK);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (Date.now() - start > timeoutMs) {
        throw new Error('Timed out waiting for the email counter lock');
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
    }
  }
  try {
    return fn();
  } finally {
    fs.rmdirSync(EMAIL_COUNTER_LOCK);
  }
}

function getNextTestEmail() {
  return withEmailCounterLock(() => {
    let next = 257;
    if (fs.existsSync(EMAIL_COUNTER_FILE)) {
      const stored = parseInt(fs.readFileSync(EMAIL_COUNTER_FILE, 'utf-8'), 10);
      if (Number.isFinite(stored)) {
        next = stored;
      }
    }
    fs.writeFileSync(EMAIL_COUNTER_FILE, String(next + 1));
    return `testae${next}_codeclouds@everlifemd.test`;
  });
}

// The whole flow is broken into one test.step() per page/section so a
// load-test reporter (see load-test/jmeter-reporter.js) can aggregate
// timing per page — not just for the flow as a whole. Each step function
// returns a boolean (or {ok}) instead of using `continue` directly, since
// `continue` can't jump out of a nested function back into the caller's
// for-loop.
async function runCheckoutFlowPerPage(page) {
  const MAX_ATTEMPTS = 3;
  let completed = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !completed; attempt++) {
    const email = getNextTestEmail();
    console.log(`Using email: ${email}`);

    const reachedBasicUserInfo = await test.step('1. Landing Page + Add to Cart', async () => {
      await page.goto('https://stagingapp.everlifemd.com/nad/v1');
      await page.locator('section').nth(1).click();
      await page.getByRole('button', { name: 'start my free online visit' }).click();
      await page.getByRole('button', { name: 'ADD TO CART' }).nth(1).click();
      // The app is a client-side SPA and auto-navigates to basic-user-info
      // on its own; a hard page.goto() here would reload the page and wipe
      // the in-memory cart state, bouncing the guard back to '/'.
      return page
        .waitForURL(/basic-user-info/, { timeout: 15000 })
        .then(() => true)
        .catch(() => false);
    });
    if (!reachedBasicUserInfo) continue;

    const reachedInfo = await test.step('2. Basic User Info (reasons + email)', async () => {
      await page.getByText('Brain fog').click();
      await page.getByRole('button', { name: 'Next Step' }).click();
      await page.getByText('Boosting metabolism and').click();
      await page.getByRole('button', { name: 'Next Step' }).click();

      await page.getByRole('textbox', { name: 'Enter Email Address' }).click();
      await page.getByRole('textbox', { name: 'Enter Email Address' }).fill(email);
      await page.getByRole('button', { name: 'CONTINUE' }).click();
      // The app routes through /account before landing on /info on its
      // own; don't force-navigate or the session state gets dropped.
      return page
        .waitForURL(/\/info/, { timeout: 15000 })
        .then(() => true)
        .catch(() => false);
    });
    if (!reachedInfo) continue;

    const personalInfoResult = await test.step('3. Personal Info', async () => {
      await page.getByRole('textbox', { name: 'First Name' }).click();
      await page.getByRole('textbox', { name: 'First Name' }).fill('Test');
      await page.getByRole('textbox', { name: 'Last Name' }).click();
      await page.getByRole('textbox', { name: 'Last Name' }).fill('Smith');
      await page.getByRole('textbox', { name: 'MM' }).click();
      await page.getByRole('textbox', { name: 'MM' }).fill('10');
      await page.getByRole('textbox', { name: 'DD' }).fill('10');
      await page.getByRole('textbox', { name: 'YYYY' }).fill('1990');
      await page.locator('#biological_sex_at_birth').selectOption('male');
      await page.getByRole('textbox', { name: 'Enter phone number' }).click();
      await page.getByRole('textbox', { name: 'Enter phone number' }).fill('(800) 555-1234');
      await page.getByRole('checkbox', { name: /I agree to Terms/i }).check();
      await page.getByRole('button', { name: 'NEXT STEP' }).click();

      // Known staging-site bug: an intermittent "Gender Allowed Consent"
      // modal sometimes rejects the user (a race reading the sex-at-birth
      // value, the message even says "biological undefineds"). Close it
      // and retry the whole flow from the start.
      const genderGateModal = page.getByRole('heading', { name: 'Gender Allowed Consent' });
      if (await genderGateModal.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Scoped to the modal's own close button — a plain name match also
        // hits an unrelated toast notification's "close" button.
        await page.locator('button.modal-button-theme', { hasText: 'Close' }).click();
        return { ok: false };
      }

      // This step's layout is genuinely nondeterministic between runs: the
      // SMS-consent checkbox may or may not render, an SMS opt-in popup
      // can appear before or after it's checked, and checking the box
      // sometimes auto-submits and sometimes still needs an explicit NEXT
      // STEP click. Poll and handle whichever control is currently present
      // until the page navigates to health-history.
      const smsCheckbox = page.getByRole('checkbox', { name: 'By checking box, you agree to' });
      const noThanksButton = page.getByRole('button', { name: 'No Thanks… I don’t want any' });
      const nextStepButton = page.getByRole('button', { name: 'NEXT STEP' });

      // The shared staging server responds noticeably slower when multiple
      // browsers run this flow concurrently, so this loop gets generous
      // per-step timeouts and enough iterations to ride that out.
      for (let i = 0; i < 15 && !page.url().includes('health-history'); i++) {
        if (await noThanksButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await noThanksButton.click();
          continue;
        }
        // Re-check the URL here too: the client-side route swap can leave
        // a stale query against the outgoing page briefly reporting
        // visible, which would otherwise try to interact with an element
        // that's already gone.
        if (page.url().includes('health-history')) break;
        if (
          (await smsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) &&
          !(await smsCheckbox.isChecked().catch(() => false))
        ) {
          // A loading overlay can cover this checkbox while an async
          // request is in flight; bound the wait so we retry via the loop
          // instead of blocking on the default 30s action timeout.
          await smsCheckbox.check({ timeout: 5000 }).catch(() => {});
          continue;
        }
        if (page.url().includes('health-history')) break;
        if (await nextStepButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
          // Bounded short timeout: if the page has already navigated away
          // underneath this stale query, fail fast instead of blocking on
          // the default 30s action timeout — the loop's own URL checks
          // handle it.
          await nextStepButton.click({ timeout: 5000 }).catch(() => {});
        }
        if (page.url().includes('health-history')) break;
        await page.waitForTimeout(1500);
      }

      // Under concurrent load the info->health-history transition can
      // stall outright; treat that the same as the gender-gate bug and
      // retry the whole flow rather than fail the test.
      const reachedHealthHistory = await page
        .waitForURL(/health-history/, { timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      return { ok: reachedHealthHistory };
    });
    if (!personalInfoResult.ok) continue;

    const reachedCheckout = await test.step('4. Health History', async () => {
      await page.getByPlaceholder('Feet').fill('5');
      await page.getByPlaceholder('Inch').fill('8');
      await page.locator('#weight_field').fill('160');
      await page.getByLabel('Metabolism', { exact: true }).check();
      await page.getByLabel('Never', { exact: true }).check();

      // Several <select> elements on this page share generated,
      // non-descriptive ids, so target them by the question text
      // immediately preceding them.
      const selectAfterText = (text) =>
        page.locator(`xpath=//p[contains(., ${JSON.stringify(text)})]/following-sibling::select[1]`);

      await selectAfterText('primary care doctor').selectOption('less than 1 year ago');
      await page.getByLabel(/NEVER had a problem with my kidneys/).check();
      await selectAfterText('problems with your liver').selectOption(
        "I've never been told I have a problem with my liver."
      );
      await page.getByLabel('None of the above', { exact: true }).check();
      await selectAfterText('B12 by pill').selectOption('No');
      await selectAfterText('B12 deficiency').selectOption('No');
      await selectAfterText('Leber').selectOption('No');
      await selectAfterText('NAD precursors').selectOption('No');
      await selectAfterText('taking any medications').selectOption("No - I affirm I'm taking any medications");
      await selectAfterText('allergies or intolerances').selectOption('No - I affirm I have no known drug allergies');
      await page
        .locator('textarea')
        .fill('Hi, I am interested in trying NAD+ therapy to help with energy and focus. No other medical concerns to add at this time.');

      await page.getByRole('button', { name: 'CONTINUE' }).click();

      // Same pattern as the info->health-history transition: this
      // submission can stall under load, so retry the whole flow rather
      // than fail.
      return page
        .waitForURL(/checkout/, { timeout: 30000 })
        .then(() => true)
        .catch(() => false);
    });
    if (!reachedCheckout) continue;

    const reachedUploadId = await test.step('5. Checkout', async () => {
      // Select the 1 Month Supply option (defaults to 3 Month).
      await page.locator('#supply_id2').check();

      // Billing address via the address-suggestion autocomplete.
      await page.getByPlaceholder('Billing Address 1').click();
      await page.getByPlaceholder('Billing Address 1').fill('2441 1/2 3rd Ave');
      await page.locator('li', { hasText: 'Saint Petersburg' }).first().click();

      // Shipping defaults to "Same as billing address", which is fine.

      await page.getByPlaceholder('Credit Card Number').fill('4242424242424242');
      await page.getByPlaceholder('Name on Card').fill('Test Smith');
      await page.locator('main select').nth(1).selectOption('12'); // expiry month
      await page.locator('main select').nth(2).selectOption('30'); // expiry year
      await page.getByPlaceholder('CVV').fill('123');
      await page.locator('input[name="checkboxes.0"]').check();

      await page.getByPlaceholder('Add discount code').fill('90manojit');
      await page.getByRole('button', { name: 'APPLY DISCOUNT CODE' }).click();
      // Give the discount request a moment to resolve (updates the order
      // summary / shows a success or error toast) before submitting.
      await page.waitForTimeout(2000);

      await page.getByRole('button', { name: 'COMPLETE YOUR SECURE PURCHASE' }).click();

      const reachedPostCheckout = await page
        .waitForURL((url) => !url.pathname.includes('checkout'), { timeout: 30000 })
        .then(() => true)
        .catch(() => false);
      if (!reachedPostCheckout) return false;

      return page
        .waitForURL(/upload-id/, { timeout: 20000 })
        .then(() => true)
        .catch(() => false);
    });
    if (!reachedUploadId) continue;

    const reachedCreatePassword = await test.step('6. Upload ID', async () => {
      // Capture a photo via the browser's (fake, in test runs) camera
      // rather than uploading a file from disk.
      const useMyCameraButton = page.locator('button.bg-blue-950');
      await page.getByRole('button', { name: /choose a file or take a photo/i }).click();
      let modalOpened = await useMyCameraButton.isVisible({ timeout: 8000 }).catch(() => false);
      if (!modalOpened) {
        // The modal occasionally doesn't open on the first click on this
        // flaky staging site; retry once before giving up on this attempt.
        await page
          .getByRole('button', { name: /choose a file or take a photo/i })
          .click({ timeout: 5000 })
          .catch(() => {});
        modalOpened = await useMyCameraButton.isVisible({ timeout: 8000 }).catch(() => false);
      }
      if (!modalOpened) return false;
      await useMyCameraButton.click(); // "Use My Camera"

      let capturedViaCamera = false;
      try {
        // Give the fake video stream a moment to actually start before
        // capturing — otherwise the capture can grab an empty/blank frame
        // and the UI silently stays on the live-preview view instead of
        // advancing to the Retake/Save screen.
        await expect(page.locator('video')).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(1500);
        await page.locator('button.bg-cyan-400').click(); // "Capture Photo"

        // Two buttons share this class at this point (Retake / Save); the
        // tooltip text is the only thing that tells them apart.
        const saveButton = page
          .locator('div.relative.group', { has: page.locator('span', { hasText: 'Save' }) })
          .locator('button');
        await expect(saveButton).toBeVisible({ timeout: 8000 });
        await saveButton.click();
        capturedViaCamera = true;
      } catch {
        // Some browsers (e.g. WebKit) don't have a reliable fake camera
        // device in test runs, so getUserMedia never produces a usable
        // frame. Fall back to uploading a photo file instead.
      }

      if (!capturedViaCamera) {
        await page.locator('button[data-modal-hide="default-modal"]').click().catch(() => {});
        await page.getByRole('button', { name: /choose a file or take a photo/i }).click();
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 });
        await page.locator('button.bg-cyan-400').click(); // "Upload"
        const fileChooser = await fileChooserPromise;

        const idPhotoPath = path.join(process.cwd(), 'fixtures', 'fake-id.png');
        await fileChooser.setFiles(idPhotoPath);
      }

      const submitIdButton = page.getByRole('button', { name: 'SUBMIT' });
      await expect(submitIdButton).toBeEnabled({ timeout: 10000 });
      await submitIdButton.click();

      return page
        .waitForURL(/create-password/, { timeout: 20000 })
        .then(() => true)
        .catch(() => false);
    });
    if (!reachedCreatePassword) continue;

    const reachedDashboard = await test.step('7. Create Password', async () => {
      await page.locator('#password').fill('123456');
      await page.getByRole('button', { name: 'SUBMIT' }).click();

      return page
        .waitForURL(/dashboard/, { timeout: 20000 })
        .then(() => true)
        .catch(() => false);
    });
    if (!reachedDashboard) continue;

    completed = true;
  }

  expect(completed, `Flow did not complete within ${MAX_ATTEMPTS} attempts (repeatedly hit the gender-gate modal bug)`).toBe(true);
}

// Number of concurrent end-to-end checkout runs. Defaults to 1 (normal
// single-run behaviour); set LOAD_COUNT to scale up for load testing, e.g.:
//   LOAD_COUNT=10 npx playwright test tests/recorded-copy.spec.js --workers=10
const LOAD_COUNT = parseInt(process.env.LOAD_COUNT || '1', 10);

for (let i = 1; i <= LOAD_COUNT; i++) {
  test(`checkout flow per-page (load ${i}/${LOAD_COUNT})`, async ({ page }) => {
    test.setTimeout(180000);
    await runCheckoutFlowPerPage(page);
  });
}
