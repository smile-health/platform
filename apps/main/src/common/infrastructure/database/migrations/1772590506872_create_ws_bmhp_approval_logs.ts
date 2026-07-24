import { sql, type Kysely } from "kysely"
import { DB } from "../types/db.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_approval_logs")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("actor_id", "bigint", (col) => col.notNull())
    .addColumn("action", "varchar(50)", (col) => col.notNull())
    .addColumn("metadata", "json")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_approval_logs")
      .addForeignKeyConstraint(
        "ws_bmhp_al_approval_period_fk",
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
  await db.schema.dropTable("ws_bmhp_approval_logs").execute()
}
