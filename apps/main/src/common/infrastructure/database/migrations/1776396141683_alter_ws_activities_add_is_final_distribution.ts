import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await sql`ALTER TABLE ws_activities ADD COLUMN is_final_distribution TINYINT(1) NULL DEFAULT NULL AFTER is_ordered_purchase`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
	await sql`ALTER TABLE ws_activities DROP COLUMN is_final_distribution`.execute(db)
}
