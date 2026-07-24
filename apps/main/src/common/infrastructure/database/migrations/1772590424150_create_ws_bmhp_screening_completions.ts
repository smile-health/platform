import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addTimestampColumns } from "../helper.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_screening_completions")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("puskesmas_entity_id", "bigint", (col) => col.notNull())
    .addColumn("examination_id", "integer", (col) => col.unsigned().notNull())
    .addColumn("status", "smallint", (col) => col.defaultTo(0))
    .addColumn("completed_at", "datetime")
    .$call(addTimestampColumns)
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_screening_completions")
      .addForeignKeyConstraint(
        "ws_bmhp_sc_approval_period_fk",
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
      .alterTable("ws_bmhp_screening_completions")
      .addForeignKeyConstraint(
        "ws_bmhp_sc_entity_fk",
        ["puskesmas_entity_id"],
        "entities",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_screening_completions")
      .addForeignKeyConstraint(
        "ws_bmhp_sc_examination_fk",
        ["examination_id"],
        "bmhp_examinations",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_screening_completions").execute()
}
