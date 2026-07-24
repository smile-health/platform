import { sql, type Kysely } from "kysely"
import { DB } from "../types/db.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_revision_notifications")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("puskesmas_entity_id", "bigint", (col) => col.notNull())
    .addColumn("message", "text", (col) => col.notNull())
    .addColumn("sent_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("sent_by", "bigint", (col) => col.notNull())
    .addColumn("read_at", "datetime")
    .addColumn("resolved_at", "datetime")
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_revision_notifications")
      .addForeignKeyConstraint(
        "ws_bmhp_rn_approval_period_fk",
        ["approval_period_id"],
        "ws_bmhp_approval_periods",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_revision_notifications")
      .addForeignKeyConstraint(
        "ws_bmhp_rn_entity_fk",
        ["puskesmas_entity_id"],
        "entities",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_revision_notifications").execute()
}
