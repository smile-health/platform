import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
const PROGRAM = 'tb';

// TC-18: a non-admin (Manager role) user must not be able to reach user management.
test('non-admin (Manager) is blocked from the user management page', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/user`);
  await expect(page).toHaveURL(/\/v5\/403/, { timeout: 15000 });
});
