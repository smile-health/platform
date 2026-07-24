import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

test.describe("GET /microplanning/problem-solutions - happy path", () => {
  const PATH = "/microplanning/problem-solutions";

  test("no params passes validation (all fields optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid village_id and keyword pass validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { village_id: "1", keyword: "measles" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/problem-solutions/village/:village_id/solutions - happy path", () => {
  const PATH = "/microplanning/problem-solutions/village/1/solutions";

  test("no query params passes validation (problem_type_id is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid problem_type_id passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { problem_type_id: "1" });
    await expectPastValidation(res);
  });
});
