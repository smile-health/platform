import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_bmhp_planning_methods")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("planning_id", "bigint")
		.addColumn("method_id", "integer", (col) => col.unsigned())
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()

	await db.schema
		.createIndex("idx_planning_method")
		.on("ws_bmhp_planning_methods")
		.columns(["planning_id", "method_id"])
		.unique()
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_bmhp_planning_methods").execute()
}
