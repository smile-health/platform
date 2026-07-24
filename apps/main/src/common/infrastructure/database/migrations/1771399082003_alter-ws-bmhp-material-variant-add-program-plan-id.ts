import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE ws_bmhp_material_variant
    ADD COLUMN program_plan_id bigint NULL AFTER is_variant
  `.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE ws_bmhp_material_variant
    DROP COLUMN program_plan_id
  `.execute(db)
}
