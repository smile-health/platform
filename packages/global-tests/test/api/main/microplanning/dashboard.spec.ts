import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

// :type path param is validated against LocationTypeParamsSchema:
// province | city | district | village (microplanning-dashboard.schema.ts)
const VALID_TYPE = "village";

for (const routePath of [
  `/microplanning/dashboard/target-consumption/${VALID_TYPE}/age`,
  `/microplanning/dashboard/target-consumption/${VALID_TYPE}/material`,
  `/microplanning/dashboard/total-target/${VALID_TYPE}`,
]) {
  test.describe(`GET ${routePath} - happy path`, () => {
    test("no params passes validation (all query fields optional)", async ({ request }) => {
      const res = await apiGet(request, routePath, {});
      await expectPastValidation(res);
    });

    test("valid filters pass validation", async ({ request }) => {
      const res = await apiGet(request, routePath, {
        page: "1",
        paginate: "10",
        status: "1",
        province_ids: "33",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      });
      await expectPastValidation(res);
    });
  });
}

test.describe("GET /microplanning/dashboard/batch - happy path", () => {
  const PATH = "/microplanning/dashboard/batch";

  test("no params passes validation (material_id is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("with material_id passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { material_id: "1" });
    await expectPastValidation(res);
  });
});
