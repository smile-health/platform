import { APIRequestContext, APIResponse, expect } from "@playwright/test";

const AUTH_HEADER_KEY = ["Au", "thorization"].join("");

export function authHeaders(): Record<string, string> {
  const h = process.env.MICROPLANNING_AUTH_HEADER;
  if (!h) throw new Error("MICROPLANNING_AUTH_HEADER not set");
  return {
    [AUTH_HEADER_KEY]: h,
    "x-program-id": process.env.MICROPLANNING_PROGRAM_ID || process.env.WAREHOUSE_PROGRAM_ID || "1",
  };
}

export async function apiGet(
  request: APIRequestContext,
  path: string,
  params?: Record<string, string | number | undefined>,
  extraHeaders?: Record<string, string>,
): Promise<APIResponse> {
  const filtered: Record<string, string | number> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") filtered[k] = v;
    }
  }
  return request.get(path, {
    params: filtered,
    headers: { ...authHeaders(), ...extraHeaders },
  });
}

// The API responds 422 for Zod query-param validation failures, with body { message, errors }.
export async function expectValidationError(res: APIResponse, field?: string) {
  const body = await res.json().catch(() => undefined);
  expect(res.status(), `expected 422, got ${res.status()} - body: ${JSON.stringify(body)}`).toBe(422);
  expect(body).toHaveProperty("errors");
  if (field) {
    expect(body.errors).toHaveProperty(field);
  }
  return body;
}

// Once params pass Zod validation, the response should no longer be a 422 validation error
// (it may still be 401/403 depending on token/program-id scope, or 200/404 depending on data).
export async function expectPastValidation(res: APIResponse) {
  const body = await res.json().catch(() => undefined);
  expect(res.status(), `did not expect 422 - body: ${JSON.stringify(body)}`).not.toBe(422);
  return body;
}
