import { sql, type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_stock_opname_periods")
    .addColumn("cutoff_date", sql`datetime after end_date`)
    .execute()

  await db.schema
    .alterTable("ws_stocks")
    .addColumn(
      "cutoff_qty",
      sql`double unsigned not null default 0 after unreceived_qty`
    )
    .execute()

  await sql`UPDATE ws_stocks SET cutoff_qty = GREATEST(qty, 0) WHERE deleted_at IS NULL`.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_stock_opname_periods")
    .dropColumn("cutoff_date")
    .execute()

  await db.schema.alterTable("ws_stocks").dropColumn("cutoff_qty").execute()
}
