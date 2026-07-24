import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .addColumn("remaining_stock_date", "date")
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .dropColumn("remaining_stock_date")
    .execute()
}
