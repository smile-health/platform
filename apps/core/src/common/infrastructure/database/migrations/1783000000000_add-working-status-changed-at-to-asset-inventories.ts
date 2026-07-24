import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("asset_inventories")
    .addColumn("working_status_changed_at", "datetime")
    .execute()

  await db.schema
    .createIndex("idx_asset_inventories_working_status_changed_at")
    .on("asset_inventories")
    .column("working_status_changed_at")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropIndex("idx_asset_inventories_working_status_changed_at")
    .on("asset_inventories")
    .execute()

  await db.schema
    .alterTable("asset_inventories")
    .dropColumn("working_status_changed_at")
    .execute()
}
