import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_bmhp_material_variant")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("material_id", "integer", (col) =>
			col.unsigned().notNull()
		)
		.addColumn("is_variant", "integer", (col) => col.defaultTo(0))
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_bmhp_material_variant").execute()
}
