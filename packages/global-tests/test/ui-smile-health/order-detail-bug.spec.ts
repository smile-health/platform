import { test, expect } from '@playwright/test';

const BASE_URL = process.env.SMILE_HEALTH_BASE_URL || 'https://smile-health.badr.co.id';

// TC-09 — known bug (BA-339): the order list returns real orders, but clicking
// "Detail" on any of them 404s. GET /main/orders/:id replies 404 "Order ID is
// not exist" for an id the list endpoint just returned, for every id and every
// program tested. Tracked as a bug, not a flaky test — remove `.fail()` once
// the backend fix ships; a passing run here means it's fixed.
test('clicking Detail on a real order does not 404 (currently broken)', async ({ page }) => {
  test.fail();

  await page.goto(
    `${BASE_URL}/id/malaria/v5/order/all?date_range=%7B%22start%22%3A%222026-01-01%22%2C%22end%22%3A%222026-09-22%22%7D`,
  );
  const detailLink = page.getByText('Detail', { exact: true }).first();
  await expect(detailLink).toBeVisible({ timeout: 20000 });
  await detailLink.click();

  await expect(page).not.toHaveURL(/\/v5\/404/, { timeout: 15000 });
  await expect(page.getByText('Halaman ini tidak ada')).not.toBeVisible();
});
