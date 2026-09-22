import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
const LOGIN_PATH = process.env.SMILE_HEALTH_LOGIN_PATH || '/id/v5/login';

// TC-02: Login gagal dengan password salah
test('rejects login with an invalid username/password combination', async ({ page }) => {
  await page.goto(`${BASE_URL}${LOGIN_PATH}`);

  await page.getByPlaceholder('Username').fill('nonexistent_user');
  await page.locator('#password').fill('wrong-password-123');
  await page.getByRole('button', { name: /masuk|login/i }).click();

  await expect(page.getByText(/tidak sesuai|tidak valid|invalid/i)).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(new RegExp(LOGIN_PATH));
});

// TC-05: Akses halaman terproteksi tanpa login harus redirect ke login, bukan expose data
for (const path of [
  '/id/v5/global-settings/program',
  '/id/wms/v5/transaction',
  '/id/wms/v5/dashboard/stock',
]) {
  test(`redirects unauthenticated access to protected route "${path}" to login`, async ({ page }) => {
    await page.goto(`${BASE_URL}${path}`);
    await expect(page).toHaveURL(/\/v5\/login/, { timeout: 15000 });
  });
}
