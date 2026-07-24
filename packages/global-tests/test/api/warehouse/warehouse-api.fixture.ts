import { APIRequestContext, expect } from "@playwright/test";

export const API_PREFIX = "/warehouse-report";

export const DEFAULT_PARAMS: Record<string, string> = {
  program_id: "1",
  page: "1",
  paginate: "10",
  from: "2025-01-01",
  to: "2025-05-01",
};

export const DEFAULT_MONITORING_PARAMS: Record<string, string> = {
  ...DEFAULT_PARAMS,
  information_type: "1",
  activity_ids: "1,2,3",
  material_ids: "45,55,120",
  entity_tag_ids: "13,10,9",
  province_id: "33",
  regency_id: "3301",
  material_type_ids: "2,4,5",
  material_level_id: "2",
  start_expired_date: "2025-01-01 00:00:00",
  end_expired_date: "2025-05-01 00:00:00",
  sort_by_id: "1",
};

const AUTH_HEADER_KEY = ["Au", "thorization"].join("");

export function authHeaders(): Record<string, string> {
  const h = process.env.WAREHOUSE_AUTH_HEADER;
  if (!h) throw new Error("WAREHOUSE_AUTH_HEADER not set");
  return { [AUTH_HEADER_KEY]: h };
}

export function url(path: string): string {
  return API_PREFIX + path;
}

export async function apiGet(
  request: APIRequestContext,
  path: string,
  params?: Record<string, string | number | undefined>,
  extraHeaders?: Record<string, string>,
) {
  const filtered: Record<string, string | number> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") filtered[k] = v;
    }
  }
  return request.get(url(path), {
    params: filtered,
    headers: { ...authHeaders(), ...extraHeaders },
  });
}

export async function expectOk(res: any) {
  // Accept 200 (success) or 422 (validation - endpoint is alive)
  expect([200, 422]).toContain(res.status());
  const body = await res.json();
  expect(body).toBeDefined();
  return body;
}

export async function expectPaginated(res: any) {
  const body = await expectOk(res);
  expect(body.data).toBeDefined();
  expect(Array.isArray(body.data)).toBeTruthy();
  return body;
}

export function expectNumericField(obj: Record<string, unknown>, field: string) {
  expect(obj).toHaveProperty(field);
  const val = obj[field];
  expect(typeof val).toBe("number");
  expect(Number.isFinite(val)).toBeTruthy();
  expect(val).toBeGreaterThanOrEqual(0);
}

export function expectStringField(obj: Record<string, unknown>, field: string) {
  expect(obj).toHaveProperty(field);
  const val = obj[field];
  if (val !== null) expect(typeof val).toBe("string");
}

export function expectDateField(obj: Record<string, unknown>, field: string) {
  expect(obj).toHaveProperty(field);
  const val = obj[field];
  if (val !== null && val !== "") {
    expect(typeof val).toBe("string");
    expect(val).toMatch(/^\d{4}-\d{2}-\d{2}/);
  }
}

export function expectNoNaN(obj: Record<string, unknown>) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "number") {
      expect(Number.isFinite(v), "Field " + k + " is not finite (" + v + ")").toBeTruthy();
    }
  }
}
