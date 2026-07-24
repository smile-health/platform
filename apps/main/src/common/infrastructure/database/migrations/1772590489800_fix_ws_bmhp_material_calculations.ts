import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_material_calculations")
    .modifyColumn("examination_id", "integer", (col) => col.unsigned().notNull())
    .execute()

  await db.schema
    .alterTable("ws_bmhp_material_calculations")
    .modifyColumn("target_group_id", "integer", (col) => col.notNull())
    .execute()

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
  try {
    await db.schema
      .alterTable("ws_bmhp_material_calculations")
      .dropConstraint("ws_bmhp_mc_examination_fk")
      .execute()
  } catch {
    /* empty */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_material_calculations")
      .dropConstraint("ws_bmhp_mc_target_group_fk")
      .execute()
  } catch {
    /* empty */
  }

  await db.schema
    .alterTable("ws_bmhp_material_calculations")
    .modifyColumn("examination_id", "bigint", (col) => col.notNull())
    .execute()

  await db.schema
    .alterTable("ws_bmhp_material_calculations")
    .modifyColumn("target_group_id", "bigint", (col) => col.notNull())
    .execute()
}
