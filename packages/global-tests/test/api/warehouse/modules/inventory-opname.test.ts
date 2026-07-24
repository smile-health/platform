import { test, expect } from "@playwright/test";
import { apiGet, expectOk, expectPaginated } from "../warehouse-api.fixture";

const PARAMS = {
  program_id: "1",
  from: "2025-01-01",
  to: "2025-05-01",
};

test.describe("Stock Opname (mounted at /stock-opname)", () => {
  const endpoints: string[] = [
    "/compliance/summary",
    "/compliance",
    "/result/summary",
    "/result",
    "/materials",
  ];

  for (const ep of endpoints) {
    test(`GET /stock-opname${ep} returns 200`, async ({ request }) => {
      const res = await apiGet(request, `/stock-opname${ep}`, PARAMS);
      await expectOk(res);
    });
  }

  const exportEndpoints: string[] = [
    "/compliance/export",
    "/result/export",
    "/materials/export",
  ];

  for (const ep of exportEndpoints) {
    test(`GET /stock-opname${ep} returns 200`, async ({ request }) => {
      const res = await apiGet(request, `/stock-opname${ep}`, PARAMS);
      const body = await res.json();
      expect(body).toBeDefined();
    });
  }
});

test.describe("Inventory Overview (mounted at /inventory)", () => {
  const endpoints: string[] = [
    "/stocks/overview",
    "/stocks/location",
    "/stocks/materials",
    "/stocks/materials/entities",
    "/activities/overview",
    "/activities/location",
    "/temperatures/overview",
    "/temperatures/location",
  ];

  for (const ep of endpoints) {
    test(`GET /inventory${ep} returns 200`, async ({ request }) => {
      const res = await apiGet(request, `/inventory${ep}`, PARAMS);
      await expectOk(res);
    });
  }
});

test.describe("Periodic Material Stock (mounted at /periodic-material-stock)", () => {
  test("GET /periodic-material-stock/ returns 200", async ({ request }) => {
    const res = await apiGet(request, "/periodic-material-stock/", PARAMS);
    await expectOk(res);
  });

  test("GET /periodic-material-stock/export returns 200", async ({ request }) => {
    const res = await apiGet(request, "/periodic-material-stock/export", PARAMS);
    const body = await res.json();
    expect(body).toBeDefined();
  });

  test("GET /periodic-material-stock/export-all returns 200", async ({ request }) => {
    const res = await apiGet(request, "/periodic-material-stock/export-all", PARAMS);
    const body = await res.json();
    expect(body).toBeDefined();
  });
});

test.describe("Stock Book (mounted at /stock-book)", () => {
  test("GET /stock-book/export returns 200", async ({ request }) => {
    const res = await apiGet(request, "/stock-book/export", PARAMS);
    const body = await res.json();
    expect(body).toBeDefined();
  });

  test("GET /stock-book/export-all returns 200", async ({ request }) => {
    const res = await apiGet(request, "/stock-book/export-all", PARAMS);
    const body = await res.json();
    expect(body).toBeDefined();
  });
});

test.describe("Transaction List (mounted at /transaction-list)", () => {
  test("GET /transaction-list/ returns 200", async ({ request }) => {
    const res = await apiGet(request, "/transaction-list/", PARAMS);
    await expectOk(res);
  });
});
