import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .addColumn("approval_period_province_id", "bigint")
    .execute()

  try {
    await db.schema
      .alterTable("ws_bmhp_approval_periods")
      .addForeignKeyConstraint(
        "ws_bap_province_fk",
        ["approval_period_province_id"],
        "ws_bmhp_approval_period_province",
        ["id"]
      )
      .execute()
  } catch {
    /* empty */
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .dropConstraint("ws_bap_province_fk")
    .execute()

  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .dropColumn("approval_period_province_id")
    .execute()
}
