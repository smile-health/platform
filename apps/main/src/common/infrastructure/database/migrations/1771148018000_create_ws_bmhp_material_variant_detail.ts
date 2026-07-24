import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_bmhp_material_variant_detail")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("material_variant_id", "bigint", (col) => col.notNull())
		.addColumn("material_id", "bigint", (col) => col.notNull())
		.addColumn("name", "varchar(150)", (col) => col.notNull())
		.addColumn("test_qty", "integer", (col) => col.unsigned())
		.addColumn("unit_id", "bigint", (col) => col.unsigned())
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_bmhp_material_variant_detail").execute()
}
