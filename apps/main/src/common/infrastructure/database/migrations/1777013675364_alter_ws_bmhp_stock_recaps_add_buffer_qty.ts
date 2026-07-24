import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_stock_recaps")
    .addColumn("buffer_qty", "integer")
    .addColumn("desk_result", "integer", (col) => col.defaultTo(0))
    .execute()

  await db.schema
    .alterTable("ws_bmhp_desk_results")
    .addColumn("desk_by", "bigint")
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_stock_recaps")
    .dropColumn("buffer_qty")
    .dropColumn("desk_result")
    .execute()

  await db.schema
    .alterTable("ws_bmhp_desk_results")
    .dropColumn("desk_by")
    .execute()
}
