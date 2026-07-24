import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addTimestampColumns } from "../helper.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_desk_results")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("status_desk", "smallint", (col) => col.defaultTo(0))
    .addColumn("ba_file_url", "varchar(255)")
    .addColumn("signature_link", "varchar(255)")
    .addColumn("desk_date", "date")
    .$call(addTimestampColumns)
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_desk_results")
      .addForeignKeyConstraint(
        "ws_bmhp_dr_approval_period_fk",
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
  await db.schema.dropTable("ws_bmhp_desk_results").execute()
}
