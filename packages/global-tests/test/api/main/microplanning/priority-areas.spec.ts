import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

const PATH = "/microplanning/priority-areas";

test.describe("GET /microplanning/priority-areas - happy path", () => {
  test("no params passes validation (all fields optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("valid village_id and previous_year=1 passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { village_id: "1", previous_year: "1" });
    await expectPastValidation(res);
  });

  test("valid previous_year=0 passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { previous_year: "0" });
    await expectPastValidation(res);
  });
});
