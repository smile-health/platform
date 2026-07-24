import type { Kysely } from 'kysely'
import { DB } from '../types/db.js';
import { addAuditColumns, addTimestampColumns } from '../helper.js';

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_microplan_absolute_target")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("microplan_id", "bigint")
		.addColumn("target_group_id", "bigint")
		.addColumn("qty", "integer")
		.addColumn("province_id", "bigint")
		.addColumn("regency_id", "bigint")
		.addColumn("subdistrict_id", "bigint")
		.addColumn("village_id", "bigint")
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_microplan_absolute_target").execute()
}
