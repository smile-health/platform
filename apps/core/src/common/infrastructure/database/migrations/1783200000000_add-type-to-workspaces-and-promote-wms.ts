import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types"

const WMS_CLIENT_ID = 4
const LEGACY_WMS_WORKSPACE_KEY = "dummywms"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("workspaces")
    .addColumn("type", "varchar(20)", (col) =>
      col.notNull().defaultTo("smile")
    )
    .execute()

  // The WMS program was represented by a single workspace row, tagged via
  // integration_associations(type='program', client_id=4) and deliberately
  // soft-deleted so it wouldn't show up as a normal SMILE program. Promote it
  // to a normal, visible workspace so WMS becomes just another program.
  const wmsAssociation = await db
    .selectFrom("integration_associations")
    .select("internal_id")
    .where("type", "=", "program")
    .where("client_id", "=", WMS_CLIENT_ID)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  const wmsWorkspaceId =
    wmsAssociation?.internal_id ??
    (
      await db
        .selectFrom("workspaces")
        .select("id")
        .where("key", "=", LEGACY_WMS_WORKSPACE_KEY)
        .executeTakeFirst()
    )?.id

  if (!wmsWorkspaceId) return

  await db
    .updateTable("workspaces")
    .set({
      type: "wms",
      deleted_at: null,
      key: "waste-management",
      name: "Waste Management",
      updated_at: sql`NOW()`,
    })
    .where("id", "=", wmsWorkspaceId)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db
    .updateTable("workspaces")
    .set({
      deleted_at: sql`NOW()`,
      key: LEGACY_WMS_WORKSPACE_KEY,
      name: LEGACY_WMS_WORKSPACE_KEY,
    })
    .where("type", "=", "wms")
    .execute()

  await db.schema.alterTable("workspaces").dropColumn("type").execute()
}
