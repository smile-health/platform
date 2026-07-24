import { Kysely, sql } from 'kysely'
import { DB } from '../types/db.js';

export async function up(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_material_needs
		ADD COLUMN material_id bigint AFTER status
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_material_needs
		DROP COLUMN material_id
	`.execute(db)
}