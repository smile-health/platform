import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
const PROGRAM = 'tb';

// TC-06: logging out invalidates the session; the protected page redirects back to login.
//
// This intentionally lives in its own project/run, wired to run strictly last
// (see playwright.config.ts "smile-health-logout"). Logging out kills the
// account's server-side Keycloak session, not just this browser context — any
// other test that reused the shared `qa-superadmin.json` storageState after
// this one ran would fail to reach protected pages.
test('logout invalidates the session and protected pages redirect to login', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/stock`);
  const userMenu = page.getByText('QA Reporter E2E');
  await expect(userMenu).toBeVisible();
  await userMenu.click({ timeout: 15000 });
  const logoutItem = page.getByText('Keluar', { exact: true });
  await expect(logoutItem).toBeVisible();
  await logoutItem.click({ timeout: 15000 });
  await expect(page).toHaveURL(/\/v5\/login/, { timeout: 20000 });

  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/stock`);
  await expect(page).toHaveURL(/\/v5\/login/, { timeout: 15000 });
});
