import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
	.createTable("ws_entity_material_activity_minmax")
	.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
	.addColumn("entity_material_activity_id", "bigint", (col) => col.notNull())
	.addColumn("annual_need_id", "bigint", (col) => col.notNull())
	.addColumn("program_plan_id", "bigint", (col) => col.notNull())
	.addColumn("min", "double precision", (col) => col.notNull())
	.addColumn("max", "double precision", (col) => col.notNull())
	.$call(addTimestampColumns)
	.$call(addAuditColumns)
	.execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_entity_material_activity_minmax").execute()
}

