import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

test.describe("GET /microplanning/estimation/detail - happy path", () => {
  const PATH = "/microplanning/estimation/detail";

  test("valid params pass validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { id: "1", category: "bias" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/estimation/immunization-service - happy path", () => {
  const PATH = "/microplanning/estimation/immunization-service";

  test("valid category=non-bias passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "non-bias" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/estimation/menu-checker - happy path", () => {
  const PATH = "/microplanning/estimation/menu-checker";

  test("valid category with keyword passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "bias", keyword: "test" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/estimation/injection-dashboard - happy path", () => {
  const PATH = "/microplanning/estimation/injection-dashboard";

  test("valid category=bias passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "bias" });
    await expectPastValidation(res);
  });
});
