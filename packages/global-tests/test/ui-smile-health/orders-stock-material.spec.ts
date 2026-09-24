import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';
// MALARIA (workspace_id=3) is the only program the QA test entity has real
// order/stock data seeded for; other programs return empty lists.
const PROGRAM = 'malaria';

// TC-08: order list loads with real data matching the API.
test('order list shows real orders for the program', async ({ page }) => {
  await page.goto(
    `${BASE_URL}/id/${PROGRAM}/v5/order/all?date_range=%7B%22start%22%3A%222026-01-01%22%2C%22end%22%3A%222026-09-22%22%7D`,
  );
  await expect(page.getByText('186140')).toBeVisible({ timeout: 20000 });
});

// TC-11: submitting the order create form with no required fields filled
// must not create an order — the submit button stays disabled.
test('create-order submit is blocked until required fields are filled', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/order/create`);
  const submitBtn = page.locator('#order-create-button-send');
  await expect(submitBtn).toBeVisible({ timeout: 20000 });
  await expect(submitBtn).toBeDisabled();
});

// TC-14: stock detail page loads with real data from the list.
test('stock detail page loads real data', async ({ page }) => {
  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/stock`);
  const detailLink = page.getByText('Detail', { exact: true }).first();
  await expect(detailLink).toBeVisible({ timeout: 20000 });
  await detailLink.click();
  await expect(page).toHaveURL(/\/stock\/detail\?/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Detail Stok' })).toBeVisible();
  await expect(page.getByText('SERENITY Alcohol Swab 2 ply')).toBeVisible();
});

// TC-16: material create form validates required fields client-side and
// does not fire a create request when submitted empty.
test('create-material form rejects an empty submission without a write', async ({ page }) => {
  const writes: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/main/materials')) writes.push(r.url());
  });

  await page.goto(`${BASE_URL}/id/${PROGRAM}/v5/material/create`);
  const submitBtn = page.getByRole('button', { name: /simpan/i }).last();
  await expect(submitBtn).toBeVisible({ timeout: 20000 });
  await submitBtn.click();

  await expect(page.getByText('Wajib diisi').first()).toBeVisible({ timeout: 10000 });
  expect(writes).toHaveLength(0);
});
