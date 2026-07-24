/**
 * Routing Engine — evaluates filter rules against an incoming CloudEvent.
 *
 * Filter key resolution:
 *   client_key              → CloudEvent extension attribute client_key, or X-Integration-Client header
 *   program_id              → CloudEvent extension attribute program_id, or data.program_id
 *   header:<name>           → HTTP header value (case-insensitive name lookup)
 *   data.<dot.path>         → dot-notation traversal of CloudEvent data object
 *   <anything else>         → CloudEvent top-level extension attribute
 *
 * Supported operators:
 *   eq (default)            → exact string equality
 *   neq                     → not equal
 *   contains                → substring match
 *   starts_with             → prefix match
 *   regex                   → new RegExp(filter_value).test(value)
 */

import safeRegex from "safe-regex";
import type { Logger } from "pino";
import type {
  IncomingEvent,
  MatchResult,
  RoutingRule,
} from "../../common/types/routing";

function resolveValue(
  filterKey: string,
  event: IncomingEvent,
): string | undefined {
  // header:<name>
  if (filterKey.startsWith("header:")) {
    const headerName = filterKey.slice(7).toLowerCase();
    return event.incomingHeaders[headerName];
  }

  // data.<path>
  if (filterKey.startsWith("data.")) {
    const path = filterKey.slice(5);
    return resolveDotPath(event.data, path);
  }

  // well-known shorthand fields
  if (filterKey === "client_key") {
    return event.client_key ?? event.integrationClient;
  }

  if (filterKey === "program_id") {
    if (event.program_id !== undefined) return event.program_id;
    return resolveDotPath(event.data, "program_id");
  }

  // fallback: CloudEvent extension attribute stored at top level of event
  const val = (event as unknown as Record<string, unknown>)[filterKey];
  return val !== undefined && val !== null ? String(val) : undefined;
}

function resolveDotPath(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current !== undefined && current !== null
    ? String(current)
    : undefined;
}

function applyOperator(
  operator: string,
  actual: string | undefined,
  expected: string,
): boolean {
  if (actual === undefined) return false;

  switch (operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "contains":
      return actual.includes(expected);
    case "starts_with":
      return actual.startsWith(expected);
    case "regex":
      try {
        return new RegExp(expected).test(actual);
      } catch {
        return false;
      }
    default:
      // Unknown operator — treat as eq
      return actual === expected;
  }
}

/**
 * Evaluates a single rule against the incoming event.
 * Pass a logger to get actionable warnings when unsafe regex patterns are blocked.
 */
export function evaluateRule(
  rule: RoutingRule,
  event: IncomingEvent,
  logger?: Logger,
): MatchResult {
  // ReDoS guard: repository filters unsafe patterns at load time,
  // but we check again here in case a rule is injected by any other path, log with full context.
  if (rule.filter_operator === "regex" && !safeRegex(rule.filter_value)) {
    logger?.warn(
      {
        ruleId: rule.id,
        topic: rule.topic,
        filterKey: rule.filter_key,
        pattern: rule.filter_value,
        remediation:
          "Set enabled=false on this rule in the integration_routing_rules table to suppress this warning.",
      },
      "Unsafe regex pattern blocked at evaluation time (ReDoS risk) — rule will not match",
    );
    return { rule, matched: false, resolvedValue: undefined };
  }

  const resolvedValue = resolveValue(rule.filter_key, event);
  const matched = applyOperator(
    rule.filter_operator,
    resolvedValue,
    rule.filter_value,
  );

  return { rule, matched, resolvedValue };
}

/**
 * Returns the subset of rules that match the event, in priority order.
 */
export function matchRules(
  rules: RoutingRule[],
  event: IncomingEvent,
  logger?: Logger,
): RoutingRule[] {
  return rules
    .map((rule) => evaluateRule(rule, event, logger))
    .filter((r) => r.matched)
    .map((r) => r.rule);
}
