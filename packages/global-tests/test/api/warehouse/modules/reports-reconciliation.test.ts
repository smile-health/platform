import { test, expect } from "@playwright/test";
import { url, apiGet, expectOk, expectPaginated, expectNumericField, expectStringField, expectDateField, expectNoNaN, DEFAULT_PARAMS } from "../warehouse-api.fixture";

test.describe("Reports — Reconciliation", () => {
  const P = { ...DEFAULT_PARAMS, program_id: "1", from: "2025-01-01", to: "2025-05-01" };
  const PROG = { program_id: "1", from: "2025-01-01", to: "2025-05-01" };

  test("GET /reconciliation/summary-report returns paginated data", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/reconciliation/summary-report", P));
    expect(body.meta).toBeDefined();
    if (body.data.length > 0) {
      const item = body.data[0];
      expectStringField(item, "health_facility");
      expectStringField(item, "entity_tag");
      expectNumericField(item, "opname_quantity");
      expectNumericField(item, "system_quantity");
      expectNumericField(item, "difference");
      expectNoNaN(item);
    }
  });

  test("GET /reconciliation/entities-report returns paginated data", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/reconciliation/entities-report", P));
    expect(body.meta).toBeDefined();
    if (body.data.length > 0) {
      const item = body.data[0];
      expectStringField(item, "health_facility");
      expectStringField(item, "entity_tag");
      expectNumericField(item, "reconciled");
      expectNumericField(item, "pending");
      expectNoNaN(item);
    }
  });

  test("GET /reconciliation/entities-report/export returns file with download headers", async ({ request }) => {
    const res = await apiGet(request, "/reconciliation/entities-report/export", PROG);
    expect(res.ok()).toBeTruthy();
    const ct = res.headers()["content-type"] || "";
    expect(ct).toMatch(/openxml|zip/);
  });
});

test.describe("Reports — Download Report", () => {
  const P = { ...DEFAULT_PARAMS, program_id: "1" };

  test("GET /download/list returns paginated download list", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/download/list", P));
    if (body.data.length > 0) {
      const item = body.data[0];
      expectStringField(item, "code");
      expectStringField(item, "name");
      expectStringField(item, "status");
    }
  });

  test("GET /download/code/:code returns download detail", async ({ request }) => {
    // Fetch a known code from the list first
    const listBody = await expectPaginated(await apiGet(request, "/download/list", P));
    expect(listBody.data.length).toBeGreaterThanOrEqual(1);
    const code = listBody.data[0].code;
    expect(typeof code).toBe("string");

    const body = await expectOk(await apiGet(request, `/download/code/${code}`, P));
    expect(body.data || body).toBeDefined();
    expectStringField(body.data || body, "code");
    expectDateField(body.data || body, "created_at");
  });
});

test.describe("Reports — LPLPO Report", () => {
  const P = { ...DEFAULT_PARAMS, program_id: "1", from: "2025-01-01", to: "2025-05-01" };
  const PROG = { program_id: "1", from: "2025-01-01", to: "2025-05-01" };

  test("GET /report/lplpo returns paginated LPLPO data", async ({ request }) => {
    const body = await expectPaginated(await apiGet(request, "/report/lplpo", P));
    if (body.data.length > 0) {
      const item = body.data[0];
      expectStringField(item, "health_facility");
      expectStringField(item, "entity_tag");
      expectNumericField(item, "beginning_balance");
      expectNumericField(item, "received");
      expectNumericField(item, "distributed");
      expectNumericField(item, "ending_balance");
      expectNoNaN(item);
    }
  });

  test("GET /report/lplpo/export returns file with download headers", async ({ request }) => {
    const res = await apiGet(request, "/report/lplpo/export", PROG);
    expect(res.ok()).toBeTruthy();
    const ct = res.headers()["content-type"] || "";
    expect(ct).toMatch(/openxml|zip/);
  });

  test("GET /report/lplpo/export/all returns file with download headers", async ({ request }) => {
    const res = await apiGet(request, "/report/lplpo/export/all", PROG);
    expect(res.ok()).toBeTruthy();
    const ct = res.headers()["content-type"] || "";
    expect(ct).toMatch(/openxml|zip/);
  });
});
