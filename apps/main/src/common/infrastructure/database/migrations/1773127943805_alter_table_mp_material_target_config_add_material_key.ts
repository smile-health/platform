import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`ALTER TABLE ws_mp_material_target_config ADD COLUMN material_key VARCHAR(50)`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`ALTER TABLE ws_mp_material_target_config DROP COLUMN material_key`.execute(db)
}
