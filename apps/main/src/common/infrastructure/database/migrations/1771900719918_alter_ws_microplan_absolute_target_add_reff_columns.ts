import { Kysely, sql } from 'kysely'
import { DB } from '../types/db.js'

export async function up(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_microplan_absolute_target
		ADD COLUMN reff_type VARCHAR(20) NULL AFTER village_id,
		ADD COLUMN reff_id BIGINT NULL AFTER reff_type
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_microplan_absolute_target
		DROP COLUMN reff_type,
		DROP COLUMN reff_id
	`.execute(db)
}
