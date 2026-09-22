import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
const PROGRAM = 'tb'; // program slug the QA test accounts are assigned to (see user_workspaces)

// TC-01 / TC-04: a logged-in session can reach the post-login program picker,
// and authenticated requests (profile/entities) succeed instead of 401/redirect.
test('logs in and lands on the program picker with the session active', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/v5/program`);
  await expect(page).toHaveURL(/\/v5\/program/);
  await expect(page.getByText('PUSKESMAS BOGOR SELATAN')).toBeVisible({ timeout: 15000 });
  // At least one assigned program renders, proving the profile/entity calls succeeded.
  await expect(page.getByText('TB', { exact: true })).toBeVisible();
});

// TC-07: dashboard/program shell loads without error for an authenticated session.
test('selecting a program loads its dashboard shell', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/v5/program`);
  const programCard = page.getByText('TB', { exact: true });
  await expect(programCard).toBeVisible();
  await programCard.click({ timeout: 15000 });
  await expect(page).toHaveURL(new RegExp(`/id/${PROGRAM}/v5/`), { timeout: 20000 });
  await expect(page.getByText('PUSKESMAS BOGOR SELATAN')).toBeVisible();
});

// TC-13: stock list loads for an authenticated session.
test('stock list page loads its filters and table shell', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/stock`);
  await expect(page.getByText('Lihat Stok')).toBeVisible({ timeout: 15000 });
});

// TC-15: material catalog loads for an authenticated session.
test('material catalog page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/material`);
  await expect(page.getByText('Pengaturan Material')).toBeVisible({ timeout: 15000 });
});

// TC-17: entities list loads for an authenticated session.
test('entities settings page loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/entity`);
  await expect(page.getByText('Pengaturan Entitas')).toBeVisible({ timeout: 15000 });
});
