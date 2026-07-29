import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types"

const WMS_CLIENT_ID = 4

/**
 * Before workspaces.type existed, "this row belongs to WMS" was recorded
 * only in integration_associations(client_id=4). This backfills the
 * equivalent, normal per-domain workspace attachment so entity/user/
 * material/asset_type membership in the WMS program flows through the same
 * tables used for every other program.
 */
export async function up(db: Kysely<Database>): Promise<void> {
  const wmsWorkspace = await db
    .selectFrom("workspaces")
    .select("id")
    .where("type", "=", "wms")
    .executeTakeFirst()

  if (!wmsWorkspace) return
  const wmsWorkspaceId = wmsWorkspace.id

  await sql`
    INSERT INTO entity_workspaces (entity_id, workspace_id, created_at, updated_at)
    SELECT ia.internal_id, ${wmsWorkspaceId}, NOW(), NOW()
    FROM integration_associations ia
    WHERE ia.type = 'entity'
      AND ia.client_id = ${WMS_CLIENT_ID}
      AND ia.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM entity_workspaces ew
        WHERE ew.entity_id = ia.internal_id AND ew.workspace_id = ${wmsWorkspaceId}
      )
  `.execute(db)

  await sql`
    INSERT INTO user_workspaces (user_id, workspace_id, created_at, updated_at)
    SELECT ia.internal_id, ${wmsWorkspaceId}, NOW(), NOW()
    FROM integration_associations ia
    WHERE ia.type = 'user'
      AND ia.client_id = ${WMS_CLIENT_ID}
      AND ia.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM user_workspaces uw
        WHERE uw.user_id = ia.internal_id AND uw.workspace_id = ${wmsWorkspaceId}
      )
  `.execute(db)

  await sql`
    INSERT INTO material_workspaces (material_id, workspace_id, created_at, updated_at)
    SELECT ia.internal_id, ${wmsWorkspaceId}, NOW(), NOW()
    FROM integration_associations ia
    WHERE ia.type = 'material'
      AND ia.client_id = ${WMS_CLIENT_ID}
      AND ia.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM material_workspaces mw
        WHERE mw.material_id = ia.internal_id AND mw.workspace_id = ${wmsWorkspaceId}
      )
  `.execute(db)

  await sql`
    INSERT INTO asset_type_workspaces (asset_type_id, workspace_id, created_at, updated_at)
    SELECT ia.internal_id, ${wmsWorkspaceId}, NOW(), NOW()
    FROM integration_associations ia
    WHERE ia.type = 'asset_type'
      AND ia.client_id = ${WMS_CLIENT_ID}
      AND ia.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM asset_type_workspaces atw
        WHERE atw.asset_type_id = ia.internal_id AND atw.workspace_id = ${wmsWorkspaceId}
      )
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  const wmsWorkspace = await db
    .selectFrom("workspaces")
    .select("id")
    .where("type", "=", "wms")
    .executeTakeFirst()

  if (!wmsWorkspace) return
  const wmsWorkspaceId = wmsWorkspace.id

  await db
    .deleteFrom("entity_workspaces")
    .where("workspace_id", "=", wmsWorkspaceId)
    .execute()
  await db
    .deleteFrom("user_workspaces")
    .where("workspace_id", "=", wmsWorkspaceId)
    .execute()
  await db
    .deleteFrom("material_workspaces")
    .where("workspace_id", "=", wmsWorkspaceId)
    .execute()
  await db
    .deleteFrom("asset_type_workspaces")
    .where("workspace_id", "=", wmsWorkspaceId)
    .execute()
}
