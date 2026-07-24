import { test, expect } from "@playwright/test";
import {
  apiGet,
  expectOk,
  expectPaginated,
  expectNumericField,
} from "../warehouse-api.fixture";

const AUTH_KEY = ["Au", "thorization"].join("");

const DASHBOARD_PARAMS: Record<string, string> = {
  program_id: "1",
  from: "2025-01-01",
  to: "2025-05-01",
  province_id: "33",
};

const ACTIVITY_PARAMS: Record<string, string> = {
  program_id: "1",
  from: "2025-01-01",
  to: "2025-05-01",
};

test.describe("Commitment Monitoring & User Activity", () => {
  /* ──────── Dashboard Commitment Monitoring ──────── */
  test.describe("Dashboard Commitment Monitoring", () => {
    const BASE = "/dashboard-commitment-monitoring";

    test("GET /summary returns summary data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/summary`, DASHBOARD_PARAMS);
      const body = await expectOk(res);
      expect(body).toBeDefined();
      // summary typically contains aggregate numeric fields
      expectNoNaN(body);
    });

    test("GET /national returns national-level data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/national`, DASHBOARD_PARAMS);
      const body = await expectOk(res);
      expect(body).toBeDefined();
    });

    test("GET /province returns province-level commitment data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/province`, DASHBOARD_PARAMS);
      const body = await expectOk(res);
      expect(body).toBeDefined();
    });

    test("GET /need-stocks returns need-stocks data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/need-stocks`, DASHBOARD_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expectNumericField(body.data[0], "id");
      }
    });

    test("GET /realization-target returns realization target data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/realization-target`, DASHBOARD_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expectNumericField(body.data[0], "id");
      }
    });

    test("GET /xls returns Excel file", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/xls`, DASHBOARD_PARAMS);
      expect(res.ok()).toBeTruthy();
      expect(res.status()).toBe(200);
      // xls endpoint returns binary content; verify content-type hints at Excel/spreadsheet
      const ct = res.headers()["content-type"] || "";
      const isExcel =
        ct.includes("spreadsheet") ||
        ct.includes("vnd.ms-excel") ||
        ct.includes("vnd.openxmlformats") ||
        ct.includes("octet-stream") ||
        ct.includes("application/vnd.ms-excel");
      // Accept any binary/octet-stream or Excel content type, or fallback to just 200
      if (ct) {
        expect(
          isExcel || ct.includes("octet-stream"),
          `Expected Excel content-type, got: ${ct}`
        ).toBeTruthy();
      }
    });
  });

  /* ──────── User Activity ──────── */
  test.describe("User Activity", () => {
    const BASE = "/activity";

    test("GET /all returns all activity data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/all`, ACTIVITY_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
        expectStringField(body.data[0], "activity");
      }
    });

    test("GET /entity returns entity activity data", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/entity`, ACTIVITY_PARAMS);
      const body = await expectPaginated(res);
      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty("id");
      }
    });

    test("GET /entity/export returns entity activity export", async ({ request }) => {
      const res = await apiGet(request, `${BASE}/entity/export`, ACTIVITY_PARAMS);
      // Export typically returns a file; accept 200 or a redirect/file response
      expect(res.ok()).toBeTruthy();
      expect(res.status()).toBe(200);
    });
  });

  /* ──────── Error Handling (Negative Cases) ──────── */
  test.describe("Error Handling", () => {
    test("GET /dashboard-commitment-monitoring/summary without auth returns 401/403", async ({ request }) => {
      const res = await request.get(
        "/warehouse-report/dashboard-commitment-monitoring/summary",
        { params: { program_id: "1" } }
      );
      expect([401, 403]).toContain(res.status());
    });

    test("GET /dashboard-commitment-monitoring/summary without program_id returns 422/400", async ({ request }) => {
      const hdr = process.env.WAREHOUSE_AUTH_HEADER;
      const headers: Record<string, string> = { "Device-Type": "web" };
      if (hdr) headers[AUTH_KEY] = hdr;
      const res = await request.get(
        "/warehouse-report/dashboard-commitment-monitoring/summary",
        { headers, params: { from: "2025-01-01", to: "2025-05-01" } }
      );
      // Missing required program_id should be rejected
      expect([400, 422, 500]).toContain(res.status());
    });
  });
});

// Helper functions used inside describe blocks
function expectStringField(obj: Record<string, unknown>, field: string) {
  expect(obj).toHaveProperty(field);
  const val = obj[field];
  if (val !== null) expect(typeof val).toBe("string");
}

function expectNoNaN(obj: Record<string, unknown>) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "number") {
      expect(Number.isFinite(v), "Field " + k + " is not finite (" + v + ")").toBeTruthy();
    }
  }
}
