import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_bmhp_planning_target_groups")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("planning_id", "bigint")
		.addColumn("target_group_id", "integer", (col) => col.unsigned())
		.addColumn("sample_count", "integer", (col) => col.notNull())
		.addColumn("test_count", "integer", (col) => col.notNull())
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()

	await db.schema
		.createIndex("idx_planning_target_group")
		.on("ws_bmhp_planning_target_groups")
		.columns(["planning_id", "target_group_id"])
		.unique()
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_bmhp_planning_target_groups").execute()
}
