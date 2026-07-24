/**
 * tests/helpers/db.ts
 *
 * Kysely DB stub factory for the rule-router test suite.
 *
 *   Main rules query (first call):
 *     db.selectFrom("integration_routing_rules")
 *       .selectAll()
 *       .where("enabled", "=", true)
 *       .orderBy("priority", "asc")
 *       .execute()
 *
 *   Change-detection snapshot (subsequent calls):
 *     db.selectFrom("integration_routing_rules")
 *       .select([...])
 *       .executeTakeFirst()
 *
 * `makeDbStub` returns:
 *   - `db`        — the stub to inject into `new RoutingRepository(db, logger)`
 *   - `mainChain` — reference to the main-query chain so individual tests can
 *                   replace `.execute` to simulate reload scenarios
 *
 * `makeDbStubThrows` returns a DB stub whose execute() always rejects, used to
 * test error handling branches in `loadRules()`.
 */

import { vi } from "vitest";
import type { RoutingRuleTable } from "../../src/common/infrastructure/database/connection";

/** Shape returned by each change-detection snapshot query. */
export interface SnapshotRow {
  max_updated_at: string | null;
  row_count: number;
}

/**
 * Returns a single snapshot row whose `row_count` matches the provided rows.
 * Convenience default so callers that do not care about refresh behaviour can
 * omit the second argument.
 */
function defaultSnapshot(rows: RoutingRuleTable[]): SnapshotRow {
  return { max_updated_at: "2024-01-01T00:00:00.000Z", row_count: rows.length };
}

/**
 * Builds a Kysely-like DB stub.
 *
 * The first call to `db.selectFrom()` returns the main rule-query chain.
 * Every subsequent call returns a snapshot chain that pops from `snapshotRows`
 * in order (cycling back to the last entry once exhausted).
 *
 * @param rows          Rows returned by the main rule query.
 * @param snapshotRows  Ordered list of snapshot results for change-detection checks.
 *                      Defaults to a single row whose `row_count` matches `rows.length`.
 *
 * @example
 * const { db } = makeDbStub([makeRow()]);
 * const repo = new RoutingRepository(db, logger);
 * await repo.loadRules();
 */
export function makeDbStub(
  rows: RoutingRuleTable[] = [],
  snapshotRows: SnapshotRow[] = [defaultSnapshot(rows)],
): { db: any; mainChain: any } {
  let snapshotCallIndex = 0;

  const mainChain = {
    selectAll: () => mainChain,
    where: () => mainChain,
    orderBy: () => mainChain,
    execute: vi.fn().mockResolvedValue(rows),
  };

  function makeSnapshotChain() {
    return {
      select: () => ({
        executeTakeFirst: vi.fn().mockImplementation(() => {
          const snapshot =
            snapshotRows[snapshotCallIndex] ??
            snapshotRows[snapshotRows.length - 1];
          snapshotCallIndex++;
          return Promise.resolve(snapshot);
        }),
      }),
    };
  }

  let callCount = 0;
  const db = {
    selectFrom: vi.fn().mockImplementation(() => {
      callCount++;
      return callCount === 1 ? mainChain : makeSnapshotChain();
    }),
  } as any;

  return { db, mainChain };
}

/**
 * Builds a DB stub whose rule query always rejects with the given error message.
 * Used to exercise error-handling branches in `RoutingRepository.loadRules()`.
 *
 * @example
 * const db = makeDbStubThrows("Table 'integration_routing_rules' doesn't exist");
 * const repo = new RoutingRepository(db, logger);
 * await expect(repo.loadRules()).resolves.toBeUndefined(); // graceful handling
 */
export function makeDbStubThrows(errorMessage: string): any {
  const failingChain = {
    selectAll: () => failingChain,
    where: () => failingChain,
    orderBy: () => failingChain,
    execute: vi.fn().mockRejectedValue(new Error(errorMessage)),
  };
  return {
    selectFrom: vi.fn().mockReturnValue(failingChain),
  };
}
