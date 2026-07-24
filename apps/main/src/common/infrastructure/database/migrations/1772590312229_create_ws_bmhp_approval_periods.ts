import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_approval_periods")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("year", "integer", (col) => col.notNull())
    .addColumn("entity_id", "bigint", (col) => col.notNull())
    .addColumn("status", "smallint", (col) => col.notNull().defaultTo(0))
    .addColumn("current_step", "smallint", (col) => col.defaultTo(1))
    .addColumn("submitted_at", "datetime")
    .addColumn("submitted_by", "bigint")
    .addColumn("approved_at", "datetime")
    .addColumn("approved_by", "bigint")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_approval_periods")
      .addForeignKeyConstraint(
        "ws_bmhp_ap_entity_fk",
        ["entity_id"],
        "entities",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_approval_periods").execute()
}
