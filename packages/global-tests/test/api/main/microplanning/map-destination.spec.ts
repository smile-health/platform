import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

const PATH = "/microplanning/map/destinations";

test.describe("GET /microplanning/map/destinations - happy path", () => {
  test("no params passes validation (category is optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid numeric category passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { category: "1" });
    await expectPastValidation(res);
  });
});
