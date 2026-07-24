import type { Kysely } from "kysely"
import { sql } from "kysely"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`
    ALTER TABLE ws_bmhp_examination_target_groups
    MODIFY COLUMN target_group_id integer NOT NULL
  `.execute(db)

  await db.schema
    .alterTable("ws_bmhp_examination_target_groups")
    .addForeignKeyConstraint(
      "ws_bmhp_examination_target_groups_target_group_id_fk",
      ["target_group_id"],
      "target_groups",
      ["id"]
    )
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_examination_target_groups")
    .dropConstraint("ws_bmhp_examination_target_groups_target_group_id_fk")
    .execute()

  await sql`
    ALTER TABLE ws_bmhp_examination_target_groups
    MODIFY COLUMN target_group_id integer UNSIGNED NOT NULL
  `.execute(db)
}
