import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

test.describe("GET /bias-immunization-logistics/calculate-detail - happy path", () => {
  const PATH = "/bias-immunization-logistics/calculate-detail";

  test("valid school_id passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { school_id: "1" });
    await expectPastValidation(res);
  });
});

test.describe("GET /bias-immunization-logistics/menu-checker - happy path", () => {
  const PATH = "/bias-immunization-logistics/menu-checker";

  test("no params passes validation (keyword is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("with keyword passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { keyword: "school" });
    await expectPastValidation(res);
  });
});
