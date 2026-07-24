import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`ALTER TABLE ws_consumptions ADD COLUMN pep_shifted_by_entity_id INT DEFAULT NULL AFTER is_pep_insertion`.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`ALTER TABLE ws_consumptions DROP COLUMN pep_shifted_by_entity_id`.execute(db)
}
