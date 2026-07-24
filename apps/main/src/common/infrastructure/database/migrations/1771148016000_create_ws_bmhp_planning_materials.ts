import type { Kysely } from "kysely"
import { DB } from "../types/db.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("ws_bmhp_planning_materials")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("planning_target_group_id", "bigint")
		.addColumn("material_id", "integer", (col) => col.unsigned())
		.addColumn("material_template_id", "integer", (col) => col.unsigned())
		.addColumn("method_id", "integer", (col) => col.unsigned())
		.addColumn("lab_usage", "integer")
		.addColumn("calculated_requirement", "integer")
		.$call(addAuditColumns)
		.$call(addTimestampColumns)
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("ws_bmhp_planning_materials").execute()
}
