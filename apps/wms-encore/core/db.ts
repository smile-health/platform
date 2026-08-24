// Real DB connection for the core group — deliberately MySQL, not Encore's
// Postgres SQLDatabase (see the other services' db.ts). This connects to
// the SAME existing MySQL database apps/core/apps/main already use — kept
// as a separate physical database from wms's Postgres one. See the
// migration plan's DB-separation note for why: different engines already,
// so "merge the apps" and "merge the databases" are independent decisions,
// and unifying engines would be a much larger, riskier project than this
// API consolidation on its own.
import { secret } from "encore.dev/config";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import type { DB } from "./db.types";

const dbHost = secret("CoreDbHost");
const dbPort = secret("CoreDbPort");
const dbUser = secret("CoreDbUser");
const dbPassword = secret("CoreDbPassword");
const dbName = secret("CoreDbName");

const pool = createPool({
  host: dbHost(),
  port: Number(dbPort()),
  user: dbUser(),
  password: dbPassword(),
  database: dbName(),
  connectionLimit: 20,
  timezone: "Z",
});

// mysql2's callback-style Pool type doesn't structurally match Kysely's own
// MysqlPool interface under strict TS (contravariant callback param
// mismatch) — this is a known friction point between the two libraries'
// type definitions, not a real runtime incompatibility; Kysely's mysql
// adapter works with mysql2's plain Pool at runtime. apps/core hits the
// same construct without a cast (see its database/index.ts) — it likely
// never runs a strict `tsc --noEmit` gate, which is how this went
// unnoticed there. Casting narrowly here rather than loosening it.
export const db = new Kysely<DB>({
  dialect: new MysqlDialect({ pool: pool as unknown as ConstructorParameters<typeof MysqlDialect>[0]["pool"] }),
});
