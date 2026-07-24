import type { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  // Add latest_history_id column to asset_inventory_rtmds
  await db.schema
    .alterTable("asset_inventory_rtmds")
    .addColumn("latest_history_id", "integer")
    .execute()

  // Create index for better performance
  await db.schema
    .createIndex("idx_asset_inventory_rtmds_latest_history_id")
    .on("asset_inventory_rtmds")
    .column("latest_history_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("idx_asset_inventory_rtmds_latest_history_id").execute()

  await db.schema
    .alterTable("asset_inventory_rtmds")
    .dropColumn("latest_history_id")
    .execute()
}