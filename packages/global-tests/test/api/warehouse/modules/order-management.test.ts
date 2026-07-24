import { test, expect } from "@playwright/test";
import { apiGet, expectPaginated } from "../warehouse-api.fixture";

const PARAMS = {
  program_id: "1",
  from: "2025-01-01",
  to: "2025-05-01",
};

const MODULES: Array<{ title: string; mount: string }> = [
  { title: "Order Difference", mount: "/order-difference" },
  { title: "Order Response", mount: "/order-response" },
  { title: "Consumption Supply", mount: "/consumption-supply" },
  { title: "Add Remove Stock", mount: "/add-remove-stock" },
  { title: "Stock Discard", mount: "/stock-discard" },
];

const SUBPATHS = ["/review", "/material", "/entity", "/location"];
const EXPORT_SUBPATHS = ["/review/export", "/material/export", "/entity/export", "/location/export"];

for (const mod of MODULES) {
  test.describe(`${mod.title} (mounted at ${mod.mount})`, () => {
    for (const sub of SUBPATHS) {
      test(`GET ${mod.mount}${sub} returns paginated 200`, async ({ request }) => {
        const res = await apiGet(request, `${mod.mount}${sub}`, PARAMS);
        await expectPaginated(res);
      });
    }

    for (const sub of EXPORT_SUBPATHS) {
      test(`GET ${mod.mount}${sub} returns 200`, async ({ request }) => {
        const res = await apiGet(request, `${mod.mount}${sub}`, PARAMS);
        const body = await res.json();
        expect(body).toBeDefined();
      });
    }
  });
}
