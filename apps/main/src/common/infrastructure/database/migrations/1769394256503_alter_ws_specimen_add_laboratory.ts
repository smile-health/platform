import { Kysely, sql } from 'kysely'
import { DB } from '../types/db.js';

export async function up(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_specimens
		ADD COLUMN reuse_examination_result integer AFTER examination_result_id,
		ADD COLUMN reuse_laboratory_id bigint AFTER reuse_examination_result
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
	await sql`
		ALTER TABLE ws_specimens
		DROP COLUMN reuse_examination_result,
		DROP COLUMN reuse_laboratory_id
	`.execute(db)
}
