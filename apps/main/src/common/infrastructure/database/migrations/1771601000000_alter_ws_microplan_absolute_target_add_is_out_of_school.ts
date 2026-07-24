import { Kysely, sql } from 'kysely'
import { DB } from '../types/db.js'

export async function up(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_microplan_absolute_target
		ADD COLUMN is_out_of_school TINYINT(1) NOT NULL DEFAULT 0 AFTER target_group_id
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_microplan_absolute_target
		DROP COLUMN is_out_of_school
	`.execute(db)
}
