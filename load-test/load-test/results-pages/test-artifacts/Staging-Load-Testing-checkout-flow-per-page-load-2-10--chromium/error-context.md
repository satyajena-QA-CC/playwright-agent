# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Staging-Load-Testing.spec.js >> checkout flow per-page (load 2/10)
- Location: tests\Staging-Load-Testing.spec.js:350:7

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('li').filter({ hasText: 'Saint Petersburg' }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link [ref=e7] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
    - main [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e16]:
          - img "lock-icon" [ref=e17]
          - paragraph [ref=e18]: 100% Encrypted & Secure Checkout
        - generic [ref=e19]:
          - img "logo" [ref=e20]
          - img "logo" [ref=e21]
          - img "logo" [ref=e22]
        - generic [ref=e23]:
          - paragraph [ref=e24]: Check Out
          - img "arrow" [ref=e25]
          - paragraph [ref=e26]: Bonus Deals
          - img "arrow" [ref=e27]
          - paragraph [ref=e28]: Receipt
        - generic [ref=e29]:
          - generic [ref=e30]:
            - iframe [ref=e34]:
              
            - heading "Contact Information" [level=2] [ref=e35]
            - generic [ref=e36]:
              - textbox "Email" [ref=e37]: testae343_codeclouds@everlifemd.test
              - textbox "Phone" [ref=e38]: (800) 555-1234
            - heading "Billing Address" [level=2] [ref=e39]
            - generic [ref=e40]:
              - generic [ref=e41]:
                - textbox "First Name" [ref=e43]: Test
                - textbox "Last Name" [ref=e45]: Smith
              - textbox "Billing Address 1" [active] [ref=e46]: 2441 1/2 3rd Ave
              - textbox "Apartment(Optional)" [ref=e47]
              - textbox "City" [ref=e48]
              - generic [ref=e49]:
                - combobox [ref=e51]:
                  - option "Select State" [selected]
                  - option "Alabama"
                  - option "Alaska"
                  - option "American Samoa"
                  - option "Arizona"
                  - option "Arkansas"
                  - option "California"
                  - option "Colorado"
                  - option "Connecticut"
                  - option "Delaware"
                  - option "District Of Columbia"
                  - option "Federated States Of Micronesia"
                  - option "Florida"
                  - option "Georgia"
                  - option "Guam"
                  - option "Hawaii"
                  - option "Idaho"
                  - option "Illinois"
                  - option "Indiana"
                  - option "Iowa"
                  - option "Kansas"
                  - option "Kentucky"
                  - option "Louisiana"
                  - option "Maine"
                  - option "Marshall Islands"
                  - option "Maryland"
                  - option "Massachusetts"
                  - option "Michigan"
                  - option "Minnesota"
                  - option "Mississippi"
                  - option "Missouri"
                  - option "Montana"
                  - option "Nebraska"
                  - option "Nevada"
                  - option "New Hampshire"
                  - option "New Jersey"
                  - option "New Mexico"
                  - option "New York"
                  - option "North Carolina"
                  - option "North Dakota"
                  - option "Northern Mariana Islands"
                  - option "Ohio"
                  - option "Oklahoma"
                  - option "Oregon"
                  - option "Palau"
                  - option "Pennsylvania"
                  - option "Puerto Rico"
                  - option "Rhode Island"
                  - option "South Carolina"
                  - option "South Dakota"
                  - option "Tennessee"
                  - option "Texas"
                  - option "Utah"
                  - option "Vermont"
                  - option "Virgin Islands"
                  - option "Virginia"
                  - option "Washington"
                  - option "West Virginia"
                  - option "Wisconsin"
                  - option "Wyoming"
                  - option "West Bengal"
                - textbox "Postal Code" [ref=e53]
            - heading "Shipping Address" [level=2] [ref=e54]
            - paragraph [ref=e55]: Specify the address for your shipment
            - generic [ref=e56]:
              - generic [ref=e57]:
                - radio "Same as billing address" [checked] [ref=e58]
                - generic [ref=e59]: Same as billing address
              - generic [ref=e60]:
                - radio "Use a different shipping address" [ref=e61]
                - generic [ref=e62]: Use a different shipping address
            - heading "Payment Method" [level=2] [ref=e63]
            - paragraph [ref=e64]: All transactions are secured and encrypted
            - generic [ref=e65]:
              - generic [ref=e66]:
                - generic [ref=e67] [cursor=pointer]:
                  - radio "Credit Card" [checked] [ref=e68]
                  - generic [ref=e69]: Credit Card
                - img "credit-card" [ref=e71]
              - textbox "Credit Card Number" [ref=e72]
              - textbox "Name on Card" [ref=e73]
              - generic [ref=e75]:
                - combobox [ref=e77]:
                  - option "MM" [selected]
                  - option "JAN"
                  - option "FEB"
                  - option "MAR"
                  - option "APR"
                  - option "MAY"
                  - option "JUN"
                  - option "JUL"
                  - option "AUG"
                  - option "SEP"
                  - option "OCT"
                  - option "NOV"
                  - option "DEC"
                - combobox [ref=e79]:
                  - option "YY" [selected]
                  - option "2026"
                  - option "2027"
                  - option "2028"
                  - option "2029"
                  - option "2030"
                  - option "2031"
                  - option "2032"
                  - option "2033"
                  - option "2034"
                  - option "2035"
                  - option "2036"
                  - option "2037"
                  - option "2038"
                  - option "2039"
                  - option "2040"
                - textbox "CVV" [ref=e81]
            - generic [ref=e83]:
              - checkbox "By clicking 'Submit' you agree to be charged and you agree to the Terms & Conditions. If you've selected the one time purchase option you will only be billed once and your supply will be shipped within 48 hours. If you've selected the automatic delivery option, your supply will be shipped within 48 hours and 1 month(s) later, your refill will start, consisting of 1 month(s) of 1-Mo, NAD+ 200mg/mL injection, 5mL vial for $195.00 and every 1 month(s) there after. You may contact the Everlife support team at support@everlifemd.com or call us at 1.800.591.0354 with any questions or adjustments to your treatments or to cancel shipment. You will be billed by EverlifeMD.com on your credit card statement." [ref=e84]
              - generic [ref=e85]: By clicking 'Submit' you agree to be charged and you agree to the Terms & Conditions. If you've selected the one time purchase option you will only be billed once and your supply will be shipped within 48 hours. If you've selected the automatic delivery option, your supply will be shipped within 48 hours and 1 month(s) later, your refill will start, consisting of 1 month(s) of 1-Mo, NAD+ 200mg/mL injection, 5mL vial for $195.00 and every 1 month(s) there after. You may contact the Everlife support team at support@everlifemd.com or call us at 1.800.591.0354 with any questions or adjustments to your treatments or to cancel shipment. You will be billed by EverlifeMD.com on your credit card statement.
            - button "COMPLETE YOUR SECURE PURCHASE →" [ref=e86]
            - generic [ref=e87]:
              - generic [ref=e88]:
                - img "lock-icon" [ref=e90]
                - text: Secure SSL Encryption
              - generic [ref=e91]:
                - img "lock-icon" [ref=e93]
                - text: Guaranteed Safe Checkout
          - generic [ref=e94]:
            - paragraph [ref=e95]:
              - text: If you order in the next 1 hour, 57 minutes, and 59 seconds,
              - text: your order is scheduled to arrive by July 20, 2026.
            - paragraph [ref=e96]: NAD+ INJECTION
            - paragraph [ref=e97]: 1 Month Supply
            - generic [ref=e98]:
              - img "1-Mo, NAD+ 200mg/mL injection, 5mL vial" [ref=e101]
              - generic [ref=e102]:
                - generic [ref=e103] [cursor=pointer]:
                  - generic [ref=e104]: MOST POPULAR
                  - radio "MOST POPULAR 6 Month Supply 158.33/mo SAVE 46%" [ref=e105]
                  - generic [ref=e106]:
                    - paragraph [ref=e107]: 6 Month Supply
                    - paragraph [ref=e109]: 158.33/mo
                  - generic [ref=e111]: SAVE 46%
                - generic [ref=e112] [cursor=pointer]:
                  - generic [ref=e113]: BEST SELLER
                  - radio "BEST SELLER 3 Month Supply $310.00/mo 175.00/mo SAVE 46%" [ref=e114]
                  - generic [ref=e115]:
                    - paragraph [ref=e116]: 3 Month Supply
                    - generic [ref=e117]:
                      - paragraph [ref=e118]: $310.00/mo
                      - paragraph [ref=e119]: 175.00/mo
                  - generic [ref=e121]: SAVE 46%
                - generic [ref=e122] [cursor=pointer]:
                  - radio "1 Month Supply $310.00/mo 195.00/mo SAVE 40%" [checked] [ref=e123]
                  - generic [ref=e124]:
                    - paragraph [ref=e125]: 1 Month Supply
                    - generic [ref=e126]:
                      - paragraph [ref=e127]: $310.00/mo
                      - paragraph [ref=e128]: 195.00/mo
                  - generic [ref=e130]: SAVE 40%
            - generic [ref=e131]:
              - generic [ref=e132]:
                - generic [ref=e133]: 1 Month Supply
                - generic [ref=e134]: $195.00
              - generic [ref=e135]:
                - generic [ref=e136]: "Doctor Consultation:"
                - generic [ref=e137]: $20.00FREE
              - generic [ref=e138]:
                - generic [ref=e139]: "Rush Shipping:"
                - generic [ref=e140]: FREE
              - generic [ref=e141]:
                - generic [ref=e142]: "Subtotal:"
                - generic [ref=e143]: $ 195.00
              - generic [ref=e144]:
                - generic [ref=e145]: "Grand Total:"
                - generic [ref=e146]: $195.00
              - generic [ref=e147]:
                - generic [ref=e148]: "Due Today:"
                - generic [ref=e149]: $0.00
            - paragraph [ref=e150]: You will only be charged if prescribed medication.
            - paragraph [ref=e151]: Refills every 1 month, cancel anytime
            - generic [ref=e153]:
              - heading "Do you have any discount code?" [level=3] [ref=e154]
              - paragraph [ref=e155]: "Add it below:"
              - textbox "Add discount code" [ref=e156]
              - button "APPLY DISCOUNT CODE ➔" [ref=e157] [cursor=pointer]:
                - text: APPLY DISCOUNT CODE
                - generic [ref=e158]: ➔
        - region "Notifications Alt+T"
    - contentinfo [ref=e159]:
      - generic [ref=e160]:
        - paragraph [ref=e161]: © 2025 by EverLife – All rights reserved.
        - paragraph [ref=e162]:
          - link "Contact Us" [ref=e163] [cursor=pointer]:
            - /url: /nad/v1/checkout#
          - text: "|"
          - link "Terms of Use" [ref=e164] [cursor=pointer]:
            - /url: /nad/v1/checkout#
          - text: "|"
          - link "Privacy Policy" [ref=e165] [cursor=pointer]:
            - /url: https://privacy.cptn.co/privacy-policy/636d61ac-192f-4dc3-a5fd-89e991415c4b
        - img "LegitScript" [ref=e166]
  - alert [ref=e167]: Everlife
```

# Test source

```ts
  131 |       // STEP click. Poll and handle whichever control is currently present
  132 |       // until the page navigates to health-history.
  133 |       const smsCheckbox = page.getByRole('checkbox', { name: 'By checking box, you agree to' });
  134 |       const noThanksButton = page.getByRole('button', { name: 'No Thanks… I don’t want any' });
  135 |       const nextStepButton = page.getByRole('button', { name: 'NEXT STEP' });
  136 | 
  137 |       // The shared staging server responds noticeably slower when multiple
  138 |       // browsers run this flow concurrently, so this loop gets generous
  139 |       // per-step timeouts and enough iterations to ride that out.
  140 |       for (let i = 0; i < 15 && !page.url().includes('health-history'); i++) {
  141 |         if (await noThanksButton.isVisible({ timeout: 3000 }).catch(() => false)) {
  142 |           await noThanksButton.click();
  143 |           continue;
  144 |         }
  145 |         // Re-check the URL here too: the client-side route swap can leave
  146 |         // a stale query against the outgoing page briefly reporting
  147 |         // visible, which would otherwise try to interact with an element
  148 |         // that's already gone.
  149 |         if (page.url().includes('health-history')) break;
  150 |         if (
  151 |           (await smsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) &&
  152 |           !(await smsCheckbox.isChecked().catch(() => false))
  153 |         ) {
  154 |           // A loading overlay can cover this checkbox while an async
  155 |           // request is in flight; bound the wait so we retry via the loop
  156 |           // instead of blocking on the default 30s action timeout.
  157 |           await smsCheckbox.check({ timeout: 5000 }).catch(() => {});
  158 |           continue;
  159 |         }
  160 |         if (page.url().includes('health-history')) break;
  161 |         if (await nextStepButton.isEnabled({ timeout: 3000 }).catch(() => false)) {
  162 |           // Bounded short timeout: if the page has already navigated away
  163 |           // underneath this stale query, fail fast instead of blocking on
  164 |           // the default 30s action timeout — the loop's own URL checks
  165 |           // handle it.
  166 |           await nextStepButton.click({ timeout: 5000 }).catch(() => {});
  167 |         }
  168 |         if (page.url().includes('health-history')) break;
  169 |         await page.waitForTimeout(1500);
  170 |       }
  171 | 
  172 |       // Under concurrent load the info->health-history transition can
  173 |       // stall outright; treat that the same as the gender-gate bug and
  174 |       // retry the whole flow rather than fail the test.
  175 |       const reachedHealthHistory = await page
  176 |         .waitForURL(/health-history/, { timeout: 20000 })
  177 |         .then(() => true)
  178 |         .catch(() => false);
  179 |       return { ok: reachedHealthHistory };
  180 |     });
  181 |     if (!personalInfoResult.ok) continue;
  182 | 
  183 |     const reachedCheckout = await test.step('4. Health History', async () => {
  184 |       await page.getByPlaceholder('Feet').fill('5');
  185 |       await page.getByPlaceholder('Inch').fill('8');
  186 |       await page.locator('#weight_field').fill('160');
  187 |       await page.getByLabel('Metabolism', { exact: true }).check();
  188 |       await page.getByLabel('Never', { exact: true }).check();
  189 | 
  190 |       // Several <select> elements on this page share generated,
  191 |       // non-descriptive ids, so target them by the question text
  192 |       // immediately preceding them.
  193 |       const selectAfterText = (text) =>
  194 |         page.locator(`xpath=//p[contains(., ${JSON.stringify(text)})]/following-sibling::select[1]`);
  195 | 
  196 |       await selectAfterText('primary care doctor').selectOption('less than 1 year ago');
  197 |       await page.getByLabel(/NEVER had a problem with my kidneys/).check();
  198 |       await selectAfterText('problems with your liver').selectOption(
  199 |         "I've never been told I have a problem with my liver."
  200 |       );
  201 |       await page.getByLabel('None of the above', { exact: true }).check();
  202 |       await selectAfterText('B12 by pill').selectOption('No');
  203 |       await selectAfterText('B12 deficiency').selectOption('No');
  204 |       await selectAfterText('Leber').selectOption('No');
  205 |       await selectAfterText('NAD precursors').selectOption('No');
  206 |       await selectAfterText('taking any medications').selectOption("No - I affirm I'm taking any medications");
  207 |       await selectAfterText('allergies or intolerances').selectOption('No - I affirm I have no known drug allergies');
  208 |       await page
  209 |         .locator('textarea')
  210 |         .fill('Hi, I am interested in trying NAD+ therapy to help with energy and focus. No other medical concerns to add at this time.');
  211 | 
  212 |       await page.getByRole('button', { name: 'CONTINUE' }).click();
  213 | 
  214 |       // Same pattern as the info->health-history transition: this
  215 |       // submission can stall under load, so retry the whole flow rather
  216 |       // than fail.
  217 |       return page
  218 |         .waitForURL(/checkout/, { timeout: 30000 })
  219 |         .then(() => true)
  220 |         .catch(() => false);
  221 |     });
  222 |     if (!reachedCheckout) continue;
  223 | 
  224 |     const reachedUploadId = await test.step('5. Checkout', async () => {
  225 |       // Select the 1 Month Supply option (defaults to 3 Month).
  226 |       await page.locator('#supply_id2').check();
  227 | 
  228 |       // Billing address via the address-suggestion autocomplete.
  229 |       await page.getByPlaceholder('Billing Address 1').click();
  230 |       await page.getByPlaceholder('Billing Address 1').fill('2441 1/2 3rd Ave');
> 231 |       await page.locator('li', { hasText: 'Saint Petersburg' }).first().click();
      |                                                                         ^ Error: locator.click: Test timeout of 180000ms exceeded.
  232 | 
  233 |       // Shipping defaults to "Same as billing address", which is fine.
  234 | 
  235 |       await page.getByPlaceholder('Credit Card Number').fill('4242424242424242');
  236 |       await page.getByPlaceholder('Name on Card').fill('Test Smith');
  237 |       await page.locator('main select').nth(1).selectOption('12'); // expiry month
  238 |       await page.locator('main select').nth(2).selectOption('30'); // expiry year
  239 |       await page.getByPlaceholder('CVV').fill('123');
  240 |       await page.locator('input[name="checkboxes.0"]').check();
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
```