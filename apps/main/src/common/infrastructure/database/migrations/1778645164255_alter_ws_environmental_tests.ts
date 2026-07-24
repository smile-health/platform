import type { Kysely } from "kysely"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  try {
    await db.schema
      .alterTable("ws_environmental_tests")
      .dropConstraint("fk_ws_environmental_tests_management_asset_id")
      .execute()
  } catch {
    // constraint may not exist, continue
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  try {
    await db.schema
      .alterTable("ws_environmental_tests")
      .addForeignKeyConstraint(
        "fk_ws_environmental_tests_management_asset_id",
        ["management_asset_id"],
        "ws_asset_inventories",
        ["id"]
      )
      .onDelete("set null")
      .onUpdate("cascade")
      .execute()
  } catch {
    // constraint may already exist or incompatible, continue
  }
}
