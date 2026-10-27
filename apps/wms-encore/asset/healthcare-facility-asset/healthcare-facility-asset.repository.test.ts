import { describe, it, expect, vi, beforeEach } from "vitest";

// Regression: the paginated list queries derive their COUNT(*) from the same
// builder that already selects every joined column. Without clearSelect()
// Postgres rejects it with 42803 ("must appear in the GROUP BY clause"),
// which surfaced as a 500 on GET /api/v1/healthcare-facility-asset.
const executed = vi.hoisted(() => [] as string[]);

vi.mock("../db", async () => {
  const { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } = await import("kysely");
  const connection = {
    async executeQuery(compiled: { sql: string }) {
      executed.push(compiled.sql);
      return { rows: compiled.sql.includes("count(*)") ? [{ count: "0" }] : [] };
    },
    async *streamQuery() {},
  };
  const db = new Kysely<any>({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => ({
        init: async () => {},
        acquireConnection: async () => connection,
        beginTransaction: async () => {},
        commitTransaction: async () => {},
        rollbackTransaction: async () => {},
        releaseConnection: async () => {},
        destroy: async () => {},
      }),
      createIntrospector: (k: Kysely<any>) => new PostgresIntrospector(k),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });
  return { db };
});
vi.mock("../../entity/entities/entities.repository", () => ({ getEntityId: vi.fn() }));

import * as repo from "./healthcare-facility-asset.repository";

const countSql = () => executed.find((s) => s.includes("count(*)"))!;

describe("healthcare-facility-asset.repository count queries", () => {
  beforeEach(() => {
    executed.length = 0;
  });

  it("findAllPaginated counts without the joined column list", async () => {
    await repo.findAllPaginated({ limit: 10, page: 1 });
    expect(countSql()).toMatch(/^select count\(\*\) as "count" from/);
  });

  it("findAllByEntityId counts without the joined column list", async () => {
    await repo.findAllByEntityId({ limit: 10, page: 1, healthcareFacilityId: 1 });
    expect(countSql()).toMatch(/^select count\(\*\) as "count" from/);
  });
});
