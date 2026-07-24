/**
 * tests/helpers/env.ts
 *
 * Shared environment helpers for the rule-router test suite.
 *
 * Two distinct use-cases are addressed:
 *
 * 1. Tests that call `validateEnv()` directly — they mutate `process.env` using
 *    raw string records (because `validateEnv` reads `process.env` internally).
 *    Use `makeMinimalProcessEnv()` + `setProcessEnv()` / `clearProcessEnv()`.
 *
 * 2. Tests that inject an already-parsed `Env` object into a module constructor
 *    (e.g. `new RoutingService(env, ...)`).
 *    Use `makeEnv()` which returns a fully-typed `Env` object.
 *
 * Both variants accept an `overrides` parameter so individual tests can swap
 * only the fields they care about without repeating boilerplate.
 */

import type { Env } from "../../src/config/env";

// ---------------------------------------------------------------------------
// Raw process.env helpers (for validateEnv() tests)
// ---------------------------------------------------------------------------

/** Minimum set of env-var strings that satisfies all Zod `.required()` fields. */
export const MINIMAL_PROCESS_ENV: Record<string, string> = {
  NODE_ENV: "test",
  DB_HOST: "db-host",
  DB_USER: "root",
  DB_PASSWORD: "secret",
  OPENHIM_CLIENT_SECRET: "client-secret",
};

/**
 * Returns a plain string record that satisfies all required env vars.
 * Pass `overrides` to add or replace individual keys.
 */
export function makeMinimalProcessEnv(
  overrides: Record<string, string> = {},
): Record<string, string> {
  return { ...MINIMAL_PROCESS_ENV, ...overrides };
}

/**
 * Saves the current `process.env` and returns a restore function.
 * Call this in `beforeEach`; call the returned function in `afterEach`.
 *
 * @example
 * let restoreEnv: () => void;
 * beforeEach(() => { restoreEnv = captureProcessEnv(); });
 * afterEach(() => restoreEnv());
 */
export function captureProcessEnv(): () => void {
  const saved = { ...process.env };

  // Start from a clean slate so ambient CI env vars do not leak into tests
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }

  return () => {
    // Remove any keys set during the test
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    // Restore the saved snapshot
    Object.assign(process.env, saved);
  };
}

/**
 * Merges a string record into `process.env`.
 * Convenience wrapper so tests read as: `setProcessEnv(makeMinimalProcessEnv(...))`.
 */
export function setProcessEnv(vars: Record<string, string>): void {
  Object.assign(process.env, vars);
}

// ---------------------------------------------------------------------------
// Parsed Env object helpers (for module-constructor injection tests)
// ---------------------------------------------------------------------------

/**
 * Base `Env` object with safe, test-suitable defaults for every field.
 * Fields that differ between unit and integration tests (e.g. protocol) can be
 * overridden via `makeEnv({ OPENHIM_HTTP_PROTOCOL: "http" })`.
 */
export const BASE_ENV: Env = {
  NODE_ENV: "test",
  PORT: 4005,
  LOG_LEVEL: "info",
  DB_HOST: "localhost",
  DB_PORT: 3306,
  DB_NAME: "smile_interop",
  DB_USER: "root",
  DB_PASSWORD: "password",
  OPENHIM_API_ENDPOINT: "https://localhost:8080",
  OPENHIM_ADMIN_EMAIL: "admin@openhim.local",
  OPENHIM_ADMIN_PASSWORD: "openhim",
  OPENHIM_HTTP_PROTOCOL: "https",
  OPENHIM_HTTP_HOST: "localhost",
  OPENHIM_HTTP_PORT: 5000,
  OPENHIM_CLIENT_ID: "smile-app",
  OPENHIM_CLIENT_SECRET: "secret",
  OPENHIM_REJECT_UNAUTHORIZED: true,
  SERVICE_HOST: "localhost",
  TARGET_REQUEST_TIMEOUT_MS: 30000,
  ROUTING_RULES_REFRESH_INTERVAL_MS: 0,
};

/**
 * Returns a fully-typed `Env` object with overrides applied.
 * Suitable for any test that injects `env` into a module constructor.
 */
export function makeEnv(overrides: Partial<Env> = {}): Env {
  return { ...BASE_ENV, ...overrides };
}

/**
 * Pre-built `Env` used by routing service / integration tests.
 * Uses `http` protocol and a specific OpenHIM host/port so that
 * URL-construction assertions have predictable values.
 */
export const TEST_ROUTING_ENV: Env = makeEnv({
  LOG_LEVEL: "error",
  OPENHIM_API_ENDPOINT: "https://openhim-host:8080",
  OPENHIM_HTTP_PROTOCOL: "http",
  OPENHIM_HTTP_HOST: "openhim-host",
  OPENHIM_HTTP_PORT: 5000,
  OPENHIM_CLIENT_ID: "smile-app",
  OPENHIM_CLIENT_SECRET: "secret123",
  OPENHIM_REJECT_UNAUTHORIZED: false,
  SERVICE_HOST: "localhost",
  TARGET_REQUEST_TIMEOUT_MS: 5000,
});
