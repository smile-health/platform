import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

test.describe("GET /microplanning/overview/steps - happy path", () => {
  const PATH = "/microplanning/overview/steps";

  test("no params passes validation (category is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid category=bias passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "bias" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/overview/config - happy path", () => {
  const PATH = "/microplanning/overview/config";

  test("no params passes validation (key is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("comma-separated key list passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { key: "target_group,material" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/overview/schools - happy path", () => {
  const PATH = "/microplanning/overview/schools";

  test("no params passes validation (pagination fields optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid pagination params pass validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { page: "1", paginate: "10", keyword: "school" });
    await expectPastValidation(res);
  });
});
