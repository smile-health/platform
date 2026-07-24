import type { Kysely } from 'kysely'
import { DB } from '../types/db.js';
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_sentinel_laboratory")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("entity_id", "bigint")
		.addColumn("start_date", "date")
		.addColumn("end_date", "date")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_sentinel_laboratory").execute()
}
