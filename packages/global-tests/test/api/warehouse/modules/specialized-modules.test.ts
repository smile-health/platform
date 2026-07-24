import { test, expect } from "@playwright/test";
import { url, apiGet, expectOk, expectPaginated, expectNumericField, expectStringField, expectNoNaN, DEFAULT_PARAMS } from "../warehouse-api.fixture";

test.describe("Specialized Modules — CCE (Cold Chain Equipment)", () => {
  const P = { ...DEFAULT_PARAMS, program_id: "1" };

  test("GET /cce/overview/aggregate-capacity-report returns data", async ({ request }) => {
    const res = await apiGet(request, "/cce/overview/aggregate-capacity-report", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toBeDefined();
    if (body.data) {
      expect(Array.isArray(body.data)).toBeTruthy();
      if (body.data.length > 0) {
        const item = body.data[0];
        expectStringField(item, "health_facility");
        expectNumericField(item, "total_capacity");
        expectNumericField(item, "used_capacity");
        expectNoNaN(item);
      }
    }
  });

  test("GET /cce/annual returns data", async ({ request }) => {
    const res = await apiGet(request, "/cce/annual", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "year");
      expectNumericField(item, "equipment_count");
      expectNoNaN(item);
    }
  });

  test("GET /cce/material returns data", async ({ request }) => {
    const res = await apiGet(request, "/cce/material", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "material_name");
      expectNumericField(item, "quantity");
      expectNoNaN(item);
    }
  });
});

test.describe("Specialized Modules — Rabies Dashboard", () => {
  const P = { program_id: "1" };

  test("GET /rabies responds and returns data", async ({ request }) => {
    const res = await apiGet(request, "/rabies", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toBeDefined();
    // Rabies dashboard may expose sub-endpoints as properties
    const root = body.data || body;
    if (typeof root === "object" && root !== null) {
      const keys = Object.keys(root);
      expect(keys.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Specialized Modules — Smile vs ASIK", () => {
  const P = { program_id: "1" };

  test("GET /asik returns comparison data", async ({ request }) => {
    const res = await apiGet(request, "/asik", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toBeDefined();
    const data = body.data || body;
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "health_facility");
      expectNumericField(item, "smile_quantity");
      expectNumericField(item, "asik_quantity");
      expectNumericField(item, "difference");
      expectNoNaN(item);
    }
  });
});

test.describe("Specialized Modules — Smile vs Biofarma", () => {
  const P = { program_id: "1" };

  test("GET /biofarma returns comparison data", async ({ request }) => {
    const res = await apiGet(request, "/biofarma", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toBeDefined();
    const data = body.data || body;
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "health_facility");
      expectNumericField(item, "smile_quantity");
      expectNumericField(item, "biofarma_quantity");
      expectNumericField(item, "difference");
      expectNoNaN(item);
    }
  });
});

test.describe("Specialized Modules — Asset Inventory", () => {
  const P = { program_id: "1" };

  test("GET /asset-inventory returns inventory data", async ({ request }) => {
    const res = await apiGet(request, "/asset-inventory", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toBeDefined();
    const data = body.data || body;
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "asset_name");
      expectStringField(item, "location");
      expectNumericField(item, "quantity");
      expectNoNaN(item);
    }
  });
});

test.describe("Specialized Modules — Asset Monitoring Device", () => {
  const P = { program_id: "1" };

  test("GET /asset-monitoring-device returns device data", async ({ request }) => {
    const res = await apiGet(request, "/asset-monitoring-device", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toBeDefined();
    const data = body.data || body;
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "device_name");
      expectStringField(item, "device_type");
      expectNumericField(item, "status");
      expectNoNaN(item);
    }
  });
});
