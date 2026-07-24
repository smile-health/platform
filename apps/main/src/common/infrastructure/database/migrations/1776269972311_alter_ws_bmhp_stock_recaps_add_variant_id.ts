import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_stock_recaps")
    .addColumn("variant_id", "bigint", (col) => col.defaultTo(null))
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_stock_recaps")
    .dropColumn("variant_id")
    .execute()
}
