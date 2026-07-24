import type { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createIndex("idx_asset_rtmd_histories_asset_rtmd_id")
    .on("asset_rtmd_histories")
    .column("asset_rtmd_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("idx_asset_rtmd_histories_asset_rtmd_id").execute()
}
