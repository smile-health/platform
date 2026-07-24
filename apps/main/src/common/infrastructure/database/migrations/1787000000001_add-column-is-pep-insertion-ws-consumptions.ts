import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`ALTER TABLE ws_consumptions ADD COLUMN is_pep_insertion TINYINT(1) DEFAULT NULL AFTER stop_notification`.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("ws_consumptions").dropColumn("is_pep_insertion").execute()
}
