/**
 * Unit tests for routing.engine.ts
 *
 * Pure functions — no I/O, no mocks required.
 * Framework: Vitest (globals: true)
 *
 * Covers: evaluateRule, matchRules, all operators, all filterKey resolution paths,
 * ReDoS guard, and edge cases (undefined values, missing fields, unknown operators).
 */

import { describe, it, expect } from "vitest";
import { evaluateRule, matchRules } from "../../../src/modules/routing/routing.engine";
import { makeRule, makeIncomingEvent, createMockLogger } from "../../helpers";

// ---------------------------------------------------------------------------
// evaluateRule — operator: eq
// ---------------------------------------------------------------------------

describe("evaluateRule — operator: eq", () => {
  it("should match when client_key equals filter_value exactly", () => {
    const rule = makeRule({ filter_key: "client_key", filter_operator: "eq", filter_value: "clinic-a" });
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    const result = evaluateRule(rule, event);

    expect(result.matched).toBe(true);
    expect(result.resolvedValue).toBe("clinic-a");
  });

  it("should not match when client_key differs from filter_value", () => {
    const rule = makeRule({ filter_key: "client_key", filter_operator: "eq", filter_value: "clinic-a" });
    const event = makeIncomingEvent({ client_key: "clinic-b" });

    const result = evaluateRule(rule, event);

    expect(result.matched).toBe(false);
  });

  it("should not match when client_key is absent and resolvedValue is undefined", () => {
    const rule = makeRule({ filter_key: "client_key", filter_operator: "eq", filter_value: "clinic-a" });
    const event = makeIncomingEvent({}); // no client_key

    const result = evaluateRule(rule, event);

    expect(result.matched).toBe(false);
    expect(result.resolvedValue).toBeUndefined();
  });

  it("should fall back to integrationClient header when client_key is absent on the event", () => {
    const rule = makeRule({ filter_key: "client_key", filter_operator: "eq", filter_value: "clinic-x" });
    const event = makeIncomingEvent({ integrationClient: "clinic-x" });

    const result = evaluateRule(rule, event);

    expect(result.matched).toBe(true);
  });

  it("given an unknown operator, should default to eq behaviour and match on exact equality", () => {
    const rule = makeRule({ filter_operator: "unknown_op", filter_key: "client_key", filter_value: "clinic-a" });
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    const result = evaluateRule(rule, event);

    expect(result.matched).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — operator: neq
// ---------------------------------------------------------------------------

describe("evaluateRule — operator: neq", () => {
  it("should match when resolved value differs from filter_value", () => {
    const rule = makeRule({ filter_operator: "neq", filter_key: "client_key", filter_value: "clinic-a" });
    const event = makeIncomingEvent({ client_key: "clinic-b" });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should not match when resolved value equals filter_value", () => {
    const rule = makeRule({ filter_operator: "neq", filter_key: "client_key", filter_value: "clinic-a" });
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    expect(evaluateRule(rule, event).matched).toBe(false);
  });

  it("should not match when resolved value is undefined — nothing to compare", () => {
    // applyOperator returns false when actual === undefined regardless of operator
    const rule = makeRule({ filter_operator: "neq", filter_key: "client_key", filter_value: "clinic-a" });
    const event = makeIncomingEvent({});

    expect(evaluateRule(rule, event).matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — operator: contains
// ---------------------------------------------------------------------------

describe("evaluateRule — operator: contains", () => {
  it("should match when resolved value contains the expected substring", () => {
    const rule = makeRule({ filter_operator: "contains", filter_key: "client_key", filter_value: "clinic" });
    const event = makeIncomingEvent({ client_key: "clinic-abc" });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should not match when resolved value does not contain the expected substring", () => {
    const rule = makeRule({ filter_operator: "contains", filter_key: "client_key", filter_value: "hospital" });
    const event = makeIncomingEvent({ client_key: "clinic-abc" });

    expect(evaluateRule(rule, event).matched).toBe(false);
  });

  it("should match when filter_value equals the entire resolved value", () => {
    const rule = makeRule({ filter_operator: "contains", filter_key: "client_key", filter_value: "clinic-abc" });
    const event = makeIncomingEvent({ client_key: "clinic-abc" });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — operator: starts_with
// ---------------------------------------------------------------------------

describe("evaluateRule — operator: starts_with", () => {
  it("should match when resolved value starts with the expected prefix", () => {
    const rule = makeRule({ filter_operator: "starts_with", filter_key: "client_key", filter_value: "clinic" });
    const event = makeIncomingEvent({ client_key: "clinic-abc" });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should not match when resolved value does not start with the expected prefix", () => {
    const rule = makeRule({ filter_operator: "starts_with", filter_key: "client_key", filter_value: "hospital" });
    const event = makeIncomingEvent({ client_key: "clinic-abc" });

    expect(evaluateRule(rule, event).matched).toBe(false);
  });

  it("should not match a suffix that only appears in the middle or end of the resolved value", () => {
    const rule = makeRule({ filter_operator: "starts_with", filter_key: "client_key", filter_value: "abc" });
    const event = makeIncomingEvent({ client_key: "clinic-abc" });

    expect(evaluateRule(rule, event).matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — operator: regex
// ---------------------------------------------------------------------------

describe("evaluateRule — operator: regex", () => {
  it("should match when the regex pattern matches the resolved value", () => {
    const rule = makeRule({ filter_operator: "regex", filter_key: "client_key", filter_value: "^clinic-\\d+$" });
    const event = makeIncomingEvent({ client_key: "clinic-42" });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should not match when the regex pattern does not match the resolved value", () => {
    const rule = makeRule({ filter_operator: "regex", filter_key: "client_key", filter_value: "^hospital" });
    const event = makeIncomingEvent({ client_key: "clinic-42" });

    expect(evaluateRule(rule, event).matched).toBe(false);
  });

  it("should return false without throwing when the pattern is not a valid regex", () => {
    // The JS RegExp constructor throws — evaluateRule must catch and return false
    const rule = makeRule({ filter_operator: "regex", filter_key: "client_key", filter_value: "[invalid" });
    const event = makeIncomingEvent({ client_key: "clinic-42" });

    expect(() => evaluateRule(rule, event)).not.toThrow();
    expect(evaluateRule(rule, event).matched).toBe(false);
  });

  it("should block a ReDoS-unsafe pattern at evaluation time and emit a logger warning", () => {
    // Regression: ReDoS guard — catastrophic backtracking must never reach the event loop.
    // Classic catastrophic backtracking pattern: (a+)+$
    const unsafePattern = "(a+)+$";
    const rule = makeRule({ filter_operator: "regex", filter_key: "client_key", filter_value: unsafePattern });
    const event = makeIncomingEvent({ client_key: "clinic" });
    const logger = createMockLogger();

    const result = evaluateRule(rule, event, logger as any);

    expect(result.matched).toBe(false);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toMatchObject({
      ruleId: rule.id,
      pattern: unsafePattern,
    });
  });

  it("should not emit a logger warning for a safe regex pattern", () => {
    const rule = makeRule({ filter_operator: "regex", filter_key: "client_key", filter_value: "^clinic-\\d+$" });
    const event = makeIncomingEvent({ client_key: "clinic-1" });
    const logger = createMockLogger();

    evaluateRule(rule, event, logger as any);

    expect(logger.warn).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — filterKey: header:<name>
// ---------------------------------------------------------------------------

describe("evaluateRule — filterKey: header:<name>", () => {
  it("should resolve the header value case-insensitively from incomingHeaders", () => {
    // filter_key uses mixed-case name; headers are stored lower-cased by the service
    const rule = makeRule({ filter_key: "header:X-Integration-Client", filter_operator: "eq", filter_value: "my-client" });
    const event = makeIncomingEvent({ incomingHeaders: { "x-integration-client": "my-client" } });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should return false when the specified header is absent from the incoming request", () => {
    const rule = makeRule({ filter_key: "header:X-Integration-Client", filter_operator: "eq", filter_value: "my-client" });
    const event = makeIncomingEvent({ incomingHeaders: {} });

    expect(evaluateRule(rule, event).matched).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — filterKey: data.<path>
// ---------------------------------------------------------------------------

describe("evaluateRule — filterKey: data.<path>", () => {
  it("should resolve a top-level field from the CloudEvent data object", () => {
    const rule = makeRule({ filter_key: "data.order_type", filter_operator: "eq", filter_value: "URGENT" });
    const event = makeIncomingEvent({ data: { order_type: "URGENT" } });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should resolve a nested field using dot-notation path traversal", () => {
    const rule = makeRule({ filter_key: "data.patient.status", filter_operator: "eq", filter_value: "active" });
    const event = makeIncomingEvent({ data: { patient: { status: "active" } } });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should return undefined when the dot-path does not exist in data", () => {
    const rule = makeRule({ filter_key: "data.patient.status", filter_operator: "eq", filter_value: "active" });
    const event = makeIncomingEvent({ data: {} });

    const result = evaluateRule(rule, event);

    expect(result.matched).toBe(false);
    expect(result.resolvedValue).toBeUndefined();
  });

  it("should return undefined when an intermediate node in the path is not an object", () => {
    const rule = makeRule({ filter_key: "data.patient.status", filter_operator: "eq", filter_value: "active" });
    const event = makeIncomingEvent({ data: { patient: "not-an-object" } });

    expect(evaluateRule(rule, event).resolvedValue).toBeUndefined();
  });

  it("should coerce a numeric data field value to string before comparison", () => {
    const rule = makeRule({ filter_key: "data.priority", filter_operator: "eq", filter_value: "3" });
    const event = makeIncomingEvent({ data: { priority: 3 } });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — filterKey: program_id
// ---------------------------------------------------------------------------

describe("evaluateRule — filterKey: program_id", () => {
  it("should resolve program_id from the top-level event field when present", () => {
    const rule = makeRule({ filter_key: "program_id", filter_operator: "eq", filter_value: "prog-99" });
    const event = makeIncomingEvent({ program_id: "prog-99" });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should fall back to data.program_id when the top-level event field is absent", () => {
    const rule = makeRule({ filter_key: "program_id", filter_operator: "eq", filter_value: "prog-42" });
    const event = makeIncomingEvent({ data: { program_id: "prog-42" } });

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should return undefined when program_id is absent from both the event and data", () => {
    const rule = makeRule({ filter_key: "program_id", filter_operator: "eq", filter_value: "prog-42" });
    const event = makeIncomingEvent({ data: {} });

    expect(evaluateRule(rule, event).resolvedValue).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// evaluateRule — filterKey: arbitrary CloudEvent extension attribute (fallback)
// ---------------------------------------------------------------------------

describe("evaluateRule — filterKey: arbitrary CloudEvent extension attribute", () => {
  it("should resolve a custom top-level field via the extension-attribute fallback path", () => {
    const rule = makeRule({ filter_key: "custom_attr", filter_operator: "eq", filter_value: "hello" });
    const event = { ...makeIncomingEvent(), custom_attr: "hello" } as any;

    expect(evaluateRule(rule, event).matched).toBe(true);
  });

  it("should return undefined when the custom attribute is absent from the event", () => {
    const rule = makeRule({ filter_key: "missing_attr", filter_operator: "eq", filter_value: "hello" });
    const event = makeIncomingEvent();

    expect(evaluateRule(rule, event).resolvedValue).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// matchRules
// ---------------------------------------------------------------------------

describe("matchRules", () => {
  it("should return only the subset of rules whose conditions are satisfied by the event", () => {
    const rules = [
      makeRule({ id: 1, filter_key: "client_key", filter_value: "clinic-a" }),                          // matches
      makeRule({ id: 2, filter_key: "client_key", filter_value: "clinic-b" }),                          // no match
      makeRule({ id: 3, filter_key: "client_key", filter_value: "clinic-a", filter_operator: "neq" }),  // no match
    ];
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    const matched = matchRules(rules, event);

    expect(matched).toHaveLength(1);
    expect(matched[0].id).toBe(1);
  });

  it("should return an empty array when no rules match the event", () => {
    const rules = [makeRule({ filter_value: "clinic-z" })];
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    expect(matchRules(rules, event)).toHaveLength(0);
  });

  it("should return an empty array when given an empty rule set", () => {
    expect(matchRules([], makeIncomingEvent())).toHaveLength(0);
  });

  it("should preserve the original rule object references in the returned array", () => {
    const rule = makeRule({ id: 42 });
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    const matched = matchRules([rule], event);

    expect(matched[0]).toBe(rule);
  });

  it("should filter out unsafe regex rules via the logger and return an empty match set", () => {
    // Regression: ReDoS guard in matchRules must call evaluateRule which blocks unsafe patterns.
    const unsafeRule = makeRule({ filter_operator: "regex", filter_value: "(a+)+$" });
    const event = makeIncomingEvent({ client_key: "clinic-a" });
    const logger = createMockLogger();

    const matched = matchRules([unsafeRule], event, logger as any);

    expect(matched).toHaveLength(0);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("should not throw when called without a logger argument", () => {
    const rule = makeRule({ filter_key: "client_key", filter_value: "clinic-a" });
    const event = makeIncomingEvent({ client_key: "clinic-a" });

    expect(() => matchRules([rule], event)).not.toThrow();
    expect(matchRules([rule], event)).toHaveLength(1);
  });
});
