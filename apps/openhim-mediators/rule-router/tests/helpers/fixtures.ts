/**
 * tests/helpers/fixtures.ts
 *
 * Shared test fixtures for the rule-router test suite.
 *
 * This file exports factory functions (not static constants) so that each test
 * receives its own fresh object and cannot accidentally mutate shared state.
 *
 * Exports:
 *  - `makeRule()`          — `RoutingRule` (post-parse, used by engine + service tests)
 *  - `makeRow()`           — `RoutingRuleTable` (raw DB row, used by repository tests)
 *  - `makeIncomingEvent()` — `IncomingEvent` (parsed CloudEvent, used by engine tests)
 *  - `makeHonoContext()`   — Minimal Hono `Context` stub for RoutingService tests
 *  - `makeMockRepository()`— `RoutingRepository` partial stub for service unit tests
 */

import { vi } from "vitest";
import type { RoutingRule, IncomingEvent } from "../../src/common/types/routing";
import type { RoutingRuleTable } from "../../src/common/infrastructure/database/connection";
import type { RoutingRepository } from "../../src/modules/routing/routing.repository";

// ---------------------------------------------------------------------------
// RoutingRule fixture (engine / service unit tests)
// ---------------------------------------------------------------------------

/**
 * Returns a `RoutingRule` with sensible defaults for a specific (non-default) rule
 * that matches `client_key = "clinic-a"` on topic `"order.created"`.
 *
 * Override any field to shape the rule for a particular test case.
 *
 * @example
 * const rule = makeRule({ filter_value: "clinic-z", is_default: true });
 */
export function makeRule(overrides: Partial<RoutingRule> = {}): RoutingRule {
  return {
    id: 1,
    topic: "order.created",
    filter_key: "client_key",
    filter_operator: "eq",
    filter_value: "clinic-a",
    target_url: "/api/v1/orders",
    target_name: "orders-adapter",
    is_default: false,
    priority: 1,
    enabled: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// RoutingRuleTable fixture (repository tests — raw DB rows)
// ---------------------------------------------------------------------------

/**
 * Returns a `RoutingRuleTable` row (as returned by mysql2/Kysely) with defaults
 * that mirror `makeRule()`.  Use this when populating `makeDbStub()`.
 *
 * Note: `is_default` and `enabled` are typed `boolean` here but mysql2 may
 * return them as `number` (0/1).  Repository tests that exercise the tinyint
 * cast should use `0 as unknown as boolean` / `1 as unknown as boolean`.
 *
 * @example
 * const row = makeRow({ topic: "order.updated", is_default: true });
 * const { db } = makeDbStub([row]);
 */
export function makeRow(overrides: Partial<RoutingRuleTable> = {}): RoutingRuleTable {
  return {
    id: 1,
    topic: "order.created",
    filter_key: "client_key",
    filter_operator: "eq",
    filter_value: "clinic-a",
    target_url: "/api/v1/orders",
    target_name: "orders-adapter",
    is_default: false,
    priority: 1,
    enabled: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// IncomingEvent fixture (engine unit tests)
// ---------------------------------------------------------------------------

/**
 * Returns a parsed `IncomingEvent` with sensible defaults for the engine tests.
 * The `topic` is already stripped of the `"com.smile."` prefix.
 *
 * @example
 * const event = makeIncomingEvent({ client_key: "clinic-b" });
 */
export function makeIncomingEvent(overrides: Partial<IncomingEvent> = {}): IncomingEvent {
  return {
    id: "evt-001",
    type: "com.smile.order.created",
    topic: "order.created",
    source: "smile-app",
    data: {},
    rawBody: "{}",
    incomingHeaders: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Hono Context stub (routing.service unit + integration tests)
// ---------------------------------------------------------------------------

/**
 * Options accepted by `makeHonoContext()`.
 */
export interface HonoContextOptions {
  /** JSON-serialisable payload to use as the request body. Defaults to `{}`. */
  body?: object | string;
  /**
   * Flat map of incoming request headers.
   * The stub exposes them via `c.req.raw.headers.forEach()` exactly as Hono does.
   */
  headers?: Record<string, string>;
  /**
   * When `true`, the body is replaced with an unparseable string so that
   * `RoutingService` takes the JSON-parse-failure code path (returns 400).
   */
  parseError?: boolean;
}

/**
 * Builds a minimal Hono `Context` stub that satisfies the interface consumed by
 * `RoutingService.handleRoute()`.
 *
 * - `c.req.text()` resolves to the serialised body (or an invalid JSON string
 *   when `parseError: true`).
 * - `c.req.raw.headers.forEach()` iterates the supplied `headers` map.
 * - `c.json(data, status)` returns a real `Response` object so tests can call
 *   `.json()` / `.status` on the result.
 *
 * @example
 * const c = makeHonoContext({ body: cloudEvent, headers: { "x-trace-id": "abc" } });
 * const res = await service.handleRoute(c);
 */
export function makeHonoContext(options: HonoContextOptions = {}) {
  const { body = {}, headers = {}, parseError = false } = options;

  const rawBody = parseError
    ? "not-json-at-all{{{"
    : typeof body === "string"
      ? body
      : JSON.stringify(body);

  const webHeaders = {
    forEach: (callback: (value: string, key: string) => void) => {
      for (const [k, v] of Object.entries(headers)) {
        callback(v, k);
      }
    },
  };

  return {
    req: {
      text: vi.fn().mockResolvedValue(rawBody),
      raw: { headers: webHeaders },
    },
    json: vi.fn().mockImplementation((data: unknown, status: number) =>
      new Response(JSON.stringify(data), { status }),
    ),
  } as any;
}

// ---------------------------------------------------------------------------
// RoutingRepository partial stub (routing.service unit tests)
// ---------------------------------------------------------------------------

/**
 * Builds a partial `RoutingRepository` stub with controllable rule lists.
 *
 * Only the two accessor methods used by `RoutingService` are stubbed.
 * The returned object is typed as `Pick<RoutingRepository, ...>` so TypeScript
 * will catch any API drift.
 *
 * @example
 * const repo = makeMockRepository([matchingRule], [defaultRule]);
 * const service = new RoutingService(env, repo as any, logger);
 */
export function makeMockRepository(
  specificRules: RoutingRule[] = [],
  defaultRules: RoutingRule[] = [],
): Pick<RoutingRepository, "getRulesForTopic" | "getDefaultRulesForTopic"> {
  return {
    getRulesForTopic: vi.fn().mockReturnValue(specificRules),
    getDefaultRulesForTopic: vi.fn().mockReturnValue(defaultRules),
  } as any;
}
