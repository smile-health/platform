import { Kysely, sql } from "kysely"
import { Database } from "../types"

// Cleans up duplicate entity_workspaces/user_workspaces rows created by a
// bug in 1783300000002_backfill-wms-workspace-assignments (didn't dedupe
// entity ids sourced from integration_associations before inserting) --
// keeps the lowest id per (entity_id, workspace_id) / (user_id,
// workspace_id) for the WMS workspace and soft-deletes the rest.
const WMS_PROGRAM_ID = 999

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`
    UPDATE entity_workspaces ew
    JOIN (
      SELECT id
      FROM (
        SELECT
          id,
          ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY id ASC) AS rn
        FROM entity_workspaces
        WHERE workspace_id = ${WMS_PROGRAM_ID} AND deleted_at IS NULL
      ) ranked
      WHERE rn > 1
    ) dupes ON dupes.id = ew.id
    SET ew.deleted_at = NOW()
  `.execute(db)

  await sql`
    UPDATE user_workspaces uw
    JOIN (
      SELECT id
      FROM (
        SELECT
          id,
          ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id ASC) AS rn
        FROM user_workspaces
        WHERE workspace_id = ${WMS_PROGRAM_ID} AND deleted_at IS NULL
      ) ranked
      WHERE rn > 1
    ) dupes ON dupes.id = uw.id
    SET uw.deleted_at = NOW()
  `.execute(db)
}

export async function down(): Promise<void> {
  // Cleanup only -- not reversible (we don't track which specific rows
  // this migration soft-deleted).
}
