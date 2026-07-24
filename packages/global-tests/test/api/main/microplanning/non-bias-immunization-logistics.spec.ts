import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

test.describe("GET /non-bias-immunization-logistics/calculate-detail - happy path", () => {
  const PATH = "/non-bias-immunization-logistics/calculate-detail";

  test("valid village_id passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { village_id: "1" });
    await expectPastValidation(res);
  });
});

test.describe("GET /non-bias-immunization-logistics/debug-consumption - happy path", () => {
  const PATH = "/non-bias-immunization-logistics/debug-consumption";

  test("no params passes validation (year is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid year passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { year: "2025" });
    await expectPastValidation(res);
  });
});

test.describe("GET /non-bias-immunization-logistics/menu-checker - happy path", () => {
  const PATH = "/non-bias-immunization-logistics/menu-checker";

  test("no params passes validation (keyword is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("with keyword passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { keyword: "village" });
    await expectPastValidation(res);
  });
});
