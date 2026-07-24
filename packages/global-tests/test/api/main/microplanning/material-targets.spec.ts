import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

const PATH = "/material-targets";

test.describe("GET /material-targets - happy path", () => {
  test("no params passes validation (all fields optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid category and type pass validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "bias", type: "primary" });
    await expectPastValidation(res);
  });

  test("valid category=non_bias and type=additional pass validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "non_bias", type: "additional" });
    await expectPastValidation(res);
  });
});
