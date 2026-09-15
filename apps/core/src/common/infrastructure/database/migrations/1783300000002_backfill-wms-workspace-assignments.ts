import { Kysely } from "kysely"
import { Database } from "../types"

// Before this branch, WMS access wasn't granted through a normal
// entity_workspaces/user_workspaces assignment row -- it was inferred at
// request time from the entity's `integration_associations` (type="entity",
// client_id=WMS_CLIENT_ID) row and the user's Keycloak resource_access
// client key. Now that WMS is just a normal program (workspace id
// WMS_PROGRAM_ID, app_type="waste_management"), those entities/users need a
// real assignment row so they keep seeing it -- this migration backfills
// exactly that, once, from the old association data.
const WMS_PROGRAM_ID = 999
const WMS_CLIENT_ID = 4

export async function up(db: Kysely<Database>): Promise<void> {
  const wmsEntities = await db
    .selectFrom("integration_associations")
    .select("internal_id as entity_id")
    .where("type", "=", "entity")
    .where("client_id", "=", WMS_CLIENT_ID)
    .where("deleted_at", "is", null)
    .execute()

  // integration_associations has no uniqueness guarantee on (type,
  // client_id, internal_id) prior to this table's own soft-delete-based
  // upsert -- dedupe explicitly so a stray duplicate association doesn't
  // produce a duplicate entity_workspaces row (which would fan out into a
  // duplicate program entry via getByFromMappedWorkspace's inner join).
  const wmsEntityIds = [...new Set(wmsEntities.map((row) => row.entity_id))]
  if (wmsEntityIds.length === 0) return

  const alreadyAssignedEntities = await db
    .selectFrom("entity_workspaces")
    .select("entity_id")
    .where("workspace_id", "=", WMS_PROGRAM_ID)
    .where("entity_id", "in", wmsEntityIds)
    .where("deleted_at", "is", null)
    .execute()
  const alreadyAssignedEntityIds = new Set(
    alreadyAssignedEntities.map((row) => row.entity_id)
  )

  const entityRowsToInsert = wmsEntityIds
    .filter((id) => !alreadyAssignedEntityIds.has(id))
    .map((entity_id) => ({ entity_id, workspace_id: WMS_PROGRAM_ID }))

  if (entityRowsToInsert.length > 0) {
    await db.insertInto("entity_workspaces").values(entityRowsToInsert).execute()
  }

  const wmsUsers = await db
    .selectFrom("users")
    .select("id as user_id")
    .where("entity_id", "in", wmsEntityIds)
    .where("deleted_at", "is", null)
    .execute()

  const wmsUserIds = [...new Set(wmsUsers.map((row) => row.user_id))]
  if (wmsUserIds.length === 0) return

  const alreadyAssignedUsers = await db
    .selectFrom("user_workspaces")
    .select("user_id")
    .where("workspace_id", "=", WMS_PROGRAM_ID)
    .where("user_id", "in", wmsUserIds)
    .where("deleted_at", "is", null)
    .execute()
  const alreadyAssignedUserIds = new Set(
    alreadyAssignedUsers.map((row) => row.user_id)
  )

  const userRowsToInsert = wmsUserIds
    .filter((id) => !alreadyAssignedUserIds.has(id))
    .map((user_id) => ({ user_id, workspace_id: WMS_PROGRAM_ID }))

  if (userRowsToInsert.length > 0) {
    await db.insertInto("user_workspaces").values(userRowsToInsert).execute()
  }
}

export async function down(): Promise<void> {
  // Backfill only -- not reversible (we don't track which rows this
  // migration created vs. already existed).
}
