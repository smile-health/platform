// Real DB connection for the smile group — mirrors core/db.ts exactly.
// This is the SAME physical MySQL database apps/core/apps/main already use;
// materials moved here from core (smile/inventory owns them, per the
// ownership pass).
//
// Lives here (smile/inventory/db.ts) rather than at smile/db.ts: `smile/` is
// just a grouping folder, not an Encore service (no encore.service.ts of its
// own — same as `wms/` isn't a service, only wms/asset, wms/disposal etc.
// nested under it are). Encore requires secret() to be called from within an
// actual service's directory tree, so a shared smile/db.ts one level up from
// the real services would fail `encore check` with "secrets must be loaded
// from within services". smile/order will cross-service import this file
// (`../inventory/db`) once it needs the same DB — a plain typed import,
// which Encore wires into the RPC/import graph the same as any other
// cross-service reference.
//
// Reuses core's secrets (CoreDbHost/CoreDbPort/etc.) rather than declaring
// new ones, since it's the same database, not a separate one.
import { secret } from "encore.dev/config";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import type { DB } from "../../core/db.types";

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
// adapter works with mysql2's plain Pool at runtime. Casting narrowly here
// rather than loosening it (see core/db.ts for the same pattern).
export const db = new Kysely<DB>({
  dialect: new MysqlDialect({ pool: pool as unknown as ConstructorParameters<typeof MysqlDialect>[0]["pool"] }),
});
