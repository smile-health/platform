import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addTimestampColumns } from "../helper.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_material_calculations")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("examination_id", "integer", (col) => col.unsigned().notNull())
    .addColumn("target_group_id", "integer", (col) => col.notNull())
    .addColumn("material_id", "bigint", (col) => col.notNull())
    .addColumn("total_target", "integer", (col) => col.notNull())
    .addColumn("consumption_rate", "decimal(10, 4)", (col) => col.notNull())
    .addColumn("total_needed", "integer", (col) => col.notNull())
    .addColumn("unit", "varchar(50)")
    .$call(addTimestampColumns)
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_material_calculations")
      .addForeignKeyConstraint(
        "ws_bmhp_mc_approval_period_fk",
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
      .alterTable("ws_bmhp_material_calculations")
      .addForeignKeyConstraint(
        "ws_bmhp_mc_examination_fk",
        ["examination_id"],
        "bmhp_examinations",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_material_calculations")
      .addForeignKeyConstraint(
        "ws_bmhp_mc_target_group_fk",
        ["target_group_id"],
        "target_groups",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_material_calculations").execute()
}
