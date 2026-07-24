import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_screening_completions")
    .modifyColumn("examination_id", "integer", (col) => col.unsigned().notNull())
    .execute()

  await db.schema
    .alterTable("ws_bmhp_screening_completions")
    .modifyColumn("completed_at", "datetime")
    .execute()

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
  try {
    await db.schema
      .alterTable("ws_bmhp_screening_completions")
      .dropConstraint("ws_bmhp_sc_examination_fk")
      .execute()
  } catch {
    /* empty */
  }

  await db.schema
    .alterTable("ws_bmhp_screening_completions")
    .modifyColumn("examination_id", "bigint", (col) => col.notNull())
    .execute()
}
