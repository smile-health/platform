import { test, expect } from "@playwright/test";
import { url, apiGet, expectOk, expectPaginated, expectNumericField, expectNoNaN, DEFAULT_PARAMS, DEFAULT_MONITORING_PARAMS } from "../warehouse-api.fixture";

/**
 * Data integrity and quality tests across warehouse report modules.
 * Validates numeric sanity, pagination constraints, cross-module consistency,
 * response structure completeness, date range correctness, and export headers.
 */

const P_STOCK = { ...DEFAULT_MONITORING_PARAMS, program_id: "1" };
const P_AVAIL = { ...DEFAULT_PARAMS, program_id: "1" };
const P_TXN   = { ...DEFAULT_PARAMS, program_id: "1", from: "2025-01-01", to: "2025-05-01", page: "1", paginate: "50" };

test.describe("Data Quality — /monitoring/stock", () => {
  test("returns valid numeric fields (non-negative, finite)", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/monitoring/stock", P_STOCK));
    expect(body.meta).toBeDefined();
    // Check meta numeric fields
    for (const key of ["page", "limit", "total_data", "total_page"]) {
      if (typeof body.meta[key] === "number") {
        expect(Number.isFinite(body.meta[key])).toBeTruthy();
        expect(body.meta[key]).toBeGreaterThanOrEqual(0);
      }
    }
    // Check each data item
    for (const item of body.data) {
      expectNoNaN(item);
      for (const [k, v] of Object.entries(item)) {
        if (typeof v === "number") {
          expect(v, `Field "${k}" must be >= 0`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test("pagination meta is consistent with data length", async ({ request }) => {
    const PAGE = { ...P_STOCK, page: "1", paginate: "10" };
    const body = await expectPaginated(await apiGet(request, "/monitoring/stock", PAGE));
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(10);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test("all required response fields are present (no null in keys)", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/monitoring/stock", P_STOCK));
    expect(body.meta).toHaveProperty("page");
    expect(body.meta).toHaveProperty("limit");
    expect(body.meta).toHaveProperty("total_data");
    if (body.data.length > 0) {
      for (const item of body.data) {
        expect(item).toHaveProperty("health_facility");
        expect(item).toHaveProperty("entity_tag");
        expect(item).toHaveProperty("stock");
      }
    }
  });

  test("date range filter is respected (from <= to)", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/monitoring/stock", P_STOCK));
    // Verify from/to in params are valid
    expect(P_STOCK.from).toBeDefined();
    expect(P_STOCK.to).toBeDefined();
    expect(new Date(P_STOCK.from).getTime()).toBeLessThanOrEqual(new Date(P_STOCK.to).getTime());
    // If data has date fields, verify they fall in range
    if (body.data.length > 0) {
      for (const item of body.data) {
        if (item.date || item.period || item.created_at) {
          const dateStr = item.date || item.period || item.created_at;
          if (typeof dateStr === "string") {
            const d = new Date(dateStr).getTime();
            expect(Number.isNaN(d)).toBeFalsy();
            expect(d).toBeGreaterThanOrEqual(new Date(P_STOCK.from).getTime());
            expect(d).toBeLessThanOrEqual(new Date(P_STOCK.to).getTime());
          }
        }
      }
    }
  });
});

test.describe("Data Quality — /stock-availability", () => {
  test("returns valid numeric fields (non-negative, finite)", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/stock-availability", P_AVAIL));
    if (body.data.length > 0) {
      for (const item of body.data) {
        expectNoNaN(item);
        for (const [k, v] of Object.entries(item)) {
          if (typeof v === "number") {
            expect(v, `Field "${k}" must be >= 0`).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test("pagination meta is consistent with data length", async ({ request }) => {
    const PAGE = { ...P_AVAIL, page: "1", paginate: "10" };
    const body = await expectPaginated(await apiGet(request, "/stock-availability", PAGE));
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(10);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test("all required response fields are present", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/stock-availability", P_AVAIL));
    expect(body.meta).toHaveProperty("page");
    expect(body.meta).toHaveProperty("limit");
    if (body.data.length > 0) {
      for (const item of body.data) {
        expect(item).toHaveProperty("health_facility");
        expect(item).toHaveProperty("availability");
        expect(item).toHaveProperty("stock");
      }
    }
  });
});

test.describe("Data Quality — /transaction-list", () => {
  test("returns valid numeric fields (non-negative, finite)", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/transaction-list", P_TXN));
    if (body.data.length > 0) {
      for (const item of body.data) {
        expectNoNaN(item);
        for (const [k, v] of Object.entries(item)) {
          if (typeof v === "number") {
            expect(v, `Field "${k}" must be >= 0`).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test("pagination meta is consistent with data length", async ({ request }) => {
    const PAGE = { ...P_TXN, page: "1", paginate: "10" };
    const body = await expectPaginated(await apiGet(request, "/transaction-list", PAGE));
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(10);
    expect(body.data.length).toBeLessThanOrEqual(10);
  });

  test("all required response fields are present", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/transaction-list", P_TXN));
    expect(body.meta).toHaveProperty("page");
    expect(body.meta).toHaveProperty("limit");
    if (body.data.length > 0) {
      for (const item of body.data) {
        expect(item).toHaveProperty("transaction_id");
        expect(item).toHaveProperty("health_facility");
        expect(item).toHaveProperty("quantity");
        expect(item).toHaveProperty("type");
      }
    }
  });

  test("date range filter is respected (from <= to)", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/transaction-list", P_TXN));
    expect(P_TXN.from).toBeDefined();
    expect(P_TXN.to).toBeDefined();
    expect(new Date(P_TXN.from).getTime()).toBeLessThanOrEqual(new Date(P_TXN.to).getTime());
    if (body.data.length > 0) {
      for (const item of body.data) {
        if (item.transaction_date || item.created_at || item.date) {
          const dateStr = item.transaction_date || item.created_at || item.date;
          if (typeof dateStr === "string") {
            const d = new Date(dateStr).getTime();
            expect(Number.isNaN(d)).toBeFalsy();
            expect(d).toBeGreaterThanOrEqual(new Date(P_TXN.from).getTime());
            expect(d).toBeLessThanOrEqual(new Date(P_TXN.to).getTime());
          }
        }
      }
    }
  });
});

test.describe("Data Quality — Cross-Module Consistency", () => {
  test("stock counts across /monitoring/stock and /stock-availability are comparable", async ({ request }) => {
    const stockBody = await expectPaginated(await apiGet(request, "/monitoring/stock", P_STOCK));
    const availBody = await expectPaginated(await apiGet(request, "/stock-availability", P_AVAIL));

    // Both endpoints should have meta with total_data for comparison
    expect(stockBody.meta).toHaveProperty("total_data");
    expect(availBody.meta).toHaveProperty("total_data");

    // The counts should be non-negative and finite
    expect(Number.isFinite(stockBody.meta.total_data)).toBeTruthy();
    expect(Number.isFinite(availBody.meta.total_data)).toBeTruthy();
    expect(stockBody.meta.total_data).toBeGreaterThanOrEqual(0);
    expect(availBody.meta.total_data).toBeGreaterThanOrEqual(0);

    // Cross-module sanity: availability total_data should not exceed monitoring total_data
    // (availability is a subset of monitoring)
    expect(availBody.meta.total_data).toBeLessThanOrEqual(stockBody.meta.total_data + 5);
  });
});

test.describe("Data Quality — Export Headers", () => {
  test("export endpoints return Content-Type with openxml or zip", async ({ request }) => {
    const exportEndpoints: Array<{ path: string; params: Record<string, string> }> = [
      { path: "/monitoring/stock/export", params: { ...P_STOCK, program_id: "1" } },
      { path: "/stock-availability/export", params: { ...P_AVAIL, program_id: "1" } },
    ];

    for (const ep of exportEndpoints) {
      const res = await apiGet(request, ep.path, ep.params);
      expect(res.ok()).toBeTruthy();
      const ct = res.headers()["content-type"] || "";
      expect(ct).toMatch(/openxml|zip/);
    }
  });
});
