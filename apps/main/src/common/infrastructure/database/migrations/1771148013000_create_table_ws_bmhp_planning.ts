import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_bmhp_planning")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("entity_id", "bigint")
		.addColumn("year", "integer", (col) => col.notNull())
		.addColumn("examination_id", "integer", (col) => col.unsigned())
		.addColumn("status", "varchar(20)")
		.addColumn("approved_by", "bigint")
		.addColumn("submitted_at", "datetime")
		.addColumn("approved_at", "datetime")
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()

	await db.schema
		.createIndex("idx_entity_year_examination")
		.on("ws_bmhp_planning")
		.columns(["entity_id", "year", "examination_id"])
		.unique()
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_bmhp_planning").execute()
}
