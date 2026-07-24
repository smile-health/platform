import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addTimestampColumns } from "../helper.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_stock_recaps")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("material_id", "bigint", (col) => col.notNull())
    .addColumn("total_needed", "integer", (col) => col.notNull())
    .addColumn("stock_on_hand", "integer", (col) => col.defaultTo(0))
    .addColumn("stock_opname_date", "date")
    .addColumn("buffer_percentage", "decimal(5, 2)", (col) =>
      col.defaultTo("10.00")
    )
    .addColumn("proposal_qty", "integer")
    .$call(addTimestampColumns)
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_stock_recaps")
      .addForeignKeyConstraint(
        "ws_bmhp_sr_approval_period_fk",
        ["approval_period_id"],
        "ws_bmhp_approval_periods",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_stock_recaps").execute()
}
