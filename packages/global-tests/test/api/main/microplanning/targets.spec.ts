import { test } from "@playwright/test";
import { apiGet, expectPastValidation } from "./microplanning-api.fixture";

// NOTE: `category_id` must be a valid key of TARGET_GROUP_NAME_TRANSFORM on the server
// (apps/main/src/modules/microplanning/targets/targets.schema.ts).

test.describe("GET /microplanning/targets - happy path", () => {
  const PATH = "/microplanning/targets";

  test("valid params pass validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { id: "1", prefix: "village", category_id: "1" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/targets/summary - happy path", () => {
  const PATH = "/microplanning/targets/summary";

  test("no params passes validation (all fields optional)", async ({ request }) => {
    const res = await apiGet(request, PATH, {});
    await expectPastValidation(res);
  });

  test("with type and target_group_ids passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { type: "bias", target_group_ids: "1,2" });
    await expectPastValidation(res);
  });
});

test.describe("GET /microplanning/targets/summary/grouped - happy path", () => {
  const PATH = "/microplanning/targets/summary/grouped";

  test("valid group_by=bias passes validation", async ({ request }) => {
    const res = await apiGet(request, PATH, { group_by: "bias" });
    await expectPastValidation(res);
  });
});
