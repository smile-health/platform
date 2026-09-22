import { test as setup, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
const LOGIN_PATH = process.env.SMILE_HEALTH_LOGIN_PATH || '/id/v5/login';

const authFile = 'test/ui-smile-health/.auth/qa-superadmin.json';

setup('authenticate as QA super admin test account', async ({ page }) => {
  const username = process.env.SMILE_HEALTH_QA_USERNAME;
  const password = process.env.SMILE_HEALTH_QA_PASSWORD;
  if (!username || !password) {
    throw new Error(
      'Missing SMILE_HEALTH_QA_USERNAME / SMILE_HEALTH_QA_PASSWORD in packages/global-tests/.env',
    );
  }

  await page.goto(`${BASE_URL}${LOGIN_PATH}`);
  await page.getByPlaceholder('Username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /masuk|login/i }).click();

  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await page.context().storageState({ path: authFile });
});
