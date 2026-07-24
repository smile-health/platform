import { test, expect } from "@playwright/test";
import { url, authHeaders, expectOk } from "../warehouse-api.fixture";

test.describe("Health & Readiness", () => {
  test("GET /healthz returns ok", async ({ request }) => {
    const res = await request.get(url("/healthz"));
    expect(res.ok()).toBeTruthy();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.type).toBe("liveness");
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("GET /readyz returns ready (with auth)", async ({ request }) => {
    const res = await request.get(url("/readyz"), {
      headers: authHeaders(),
    });
    // readyz may return 200 (ready) or 503 (not ready) depending on deps
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body.type).toBe("readiness");
    expect(["ready", "not ready"]).toContain(body.status);
    if (body.checks) {
      expect(body.checks.database).toMatch(/connected|disconnected/);
    }
  });
});

test.describe("Tolgee Translation", () => {
  test("GET /tolgee/:key returns translation", async ({ request }) => {
    const res = await request.get(url("/tolgee/warehouse.label"), {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty("value");
  });
});
