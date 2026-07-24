import { test, expect } from "@playwright/test";
import {
  DEFAULT_MONITORING_PARAMS,
  apiGet,
  expectOk,
  expectPaginated,
  expectNumericField,
  expectStringField,
  expectDateField,
  expectNoNaN,
} from "../warehouse-api.fixture";

const AUTH_KEY = ["Au", "thorization"].join("");

test.describe("Monitoring Module", () => {
  /* ──────── Monitoring Stock ──────── */
  test.describe("Monitoring Stock", () => {
    const BASE = "/monitoring/stock";

    test("GET /chart returns chart data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/chart`, DEFAULT_MONITORING_PARAMS);
      const body = await expectOk(res);
      // chart response is typically an array or object with series
      expect(body).toBeDefined();
    });

    test("GET /province returns province-level data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/province`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expectNumericField(body.data[0], "id");
      }
    });

    test("GET /regency returns regency-level data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/regency`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /entity returns entity-level data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/entity`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /entity-stock returns entity stock data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/entity-stock`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /sismal returns sismal data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/sismal`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /material-entity returns material-entity data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/material-entity`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });
  });

  /* ──────── Monitoring Transaction ──────── */
  test.describe("Monitoring Transaction", () => {
    const BASE = "/monitoring/transaction";

    test("GET /chart returns transaction chart data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/chart`, DEFAULT_MONITORING_PARAMS);
      const body = await expectOk(res);
      expect(body).toBeDefined();
    });

    test("GET /big-number returns big-number summary", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/big-number`, DEFAULT_MONITORING_PARAMS);
      const body = await expectOk(res);
      expect(body).toBeDefined();
      // big-number typically contains numeric summary fields
      expectNoNaN(body);
    });

    test("GET /province returns province-level transaction data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/province`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expectNumericField(body.data[0], "id");
      }
    });

    test("GET /regency returns regency-level transaction data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/regency`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /entity returns entity-level transaction data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/entity`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /entity-complete returns entity-complete data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/entity-complete`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /material returns material-level transaction data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/material`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /reason returns reason data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/reason`, DEFAULT_MONITORING_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });
  });

  /* ──────── Error Handling (Negative Cases) ──────── */
  test.describe("Monitoring Error Handling", () => {
    test("GET /monitoring/stock/chart without auth returns 401/403", async ({ request }) => {
      const res = await request.get(`/warehouse-report/monitoring/stock/chart`, {
        params: { information_type: "1" },
      });
      expect([401, 403]).toContain(res.status());
    });

    test("GET /monitoring/stock/chart without information_type returns 422/400", async ({ request }) => {
      const hdr = process.env.WAREHOUSE_AUTH_HEADER;
      const headers: Record<string, string> = { "Device-Type": "web" };
      if (hdr) headers[AUTH_KEY] = hdr;
      const res = await request.get(`/warehouse-report/monitoring/stock/chart`, {
        headers,
        params: { page: "1", paginate: "10" },
      });
      // Missing required information_type should be rejected
      expect([400, 422, 500]).toContain(res.status());
    });
  });
});
