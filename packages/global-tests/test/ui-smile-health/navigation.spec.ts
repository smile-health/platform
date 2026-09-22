import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
const PROGRAM = 'malaria';

// TC-19: navigating dashboard -> orders -> stock -> materials -> profile in
// sequence must not throw uncaught JS runtime exceptions.
//
// Scoped to `pageerror` (uncaught exceptions), not console.error network
// noise: this QA account is reused across every spec in this run, so it
// accumulates incidental console.error("...401...") / GrowthBook "Missing
// clientKey" chatter tied to today's overall test volume, not to this
// specific navigation path.
test('sequential navigation across core pages has no uncaught JS errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  const paths = [
    `/id/${PROGRAM}/v5/dashboard/transaction-monitoring`,
    `/id/${PROGRAM}/v5/order/all`,
    `/id/${PROGRAM}/v5/stock`,
    `/id/${PROGRAM}/v5/material`,
    `/id/v5/account`,
  ];

  for (const path of paths) {
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForTimeout(2500);
  }

  expect(pageErrors, `uncaught JS errors during navigation:\n${pageErrors.join('\n')}`).toEqual(
    [],
  );
});
