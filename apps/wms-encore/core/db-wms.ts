// Separate DB connection for the wms-local Postgres tables ported from
// entity/db.ts and users/db.ts (the pre-consolidation entity/ and users/
// services). These submodules (entities, users, entity-location,
// entity-settings, global-settings, region, user-role, user-fcm-token) query
// wms's own Postgres database — a distinct physical database/schema from
// core/db.ts's MySQL connection (which serves apps/core's canonical
// entities/users tables). Kept as its own file rather than merged into
// db.ts so core's MySQL-only submodules aren't affected.
import { wmsDatabase, initDB } from "../db/db";

export const db = initDB(wmsDatabase);
