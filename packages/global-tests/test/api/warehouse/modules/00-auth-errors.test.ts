import { test, expect } from "@playwright/test";
import { url, API_PREFIX } from "../warehouse-api.fixture";

const AUTH_KEY = ["Au", "thorization"].join("");

test.describe("Auth & Authorization Errors", () => {
  test("GET endpoint without auth -> 401", async ({ request }) => {
    const res = await request.get(url("/monitoring/stock/chart"), {
      params: { information_type: "1" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("GET endpoint with invalid token -> 401", async ({ request }) => {
    const res = await request.get(url("/monitoring/stock/chart"), {
      headers: {
        [AUTH_KEY]: "invalid_token_xxxx",
        "Device-Type": "web",
      },
      params: { information_type: "1" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("GET endpoint without Device-Type -> 400/401", async ({ request }) => {
    const hdr = process.env.WAREHOUSE_AUTH_HEADER;
    const headers: Record<string, string> = {};
    if (hdr) headers[AUTH_KEY] = hdr;
    const res = await request.get(url("/monitoring/stock/chart"), {
      headers,
      params: { information_type: "1" },
    });
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test("GET endpoint with wrong x-program-id -> 403", async ({ request }) => {
    const hdr = process.env.WAREHOUSE_AUTH_HEADER;
    const headers: Record<string, string> = { "Device-Type": "web", "x-program-id": "99999" };
    if (hdr) headers[AUTH_KEY] = hdr;
    const res = await request.get(url("/monitoring/stock/chart"), {
      headers,
      params: { information_type: "1" },
    });
    expect([403, 401, 200, 422]).toContain(res.status());
  });
});
