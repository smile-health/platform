import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable("ws_microplanning_patient_targets")
		.addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
		.addColumn("patient_id", "bigint", (col) => col.notNull())
		.addColumn("microplanning_id", "bigint", (col) => col.notNull())
		.addColumn("target_group_id", "integer")
		.$call(addTimestampColumns)
		.execute()

	await db.schema
		.createIndex("idx_ws_microplanning_patient_targets_unique")
		.on("ws_microplanning_patient_targets")
		.columns(["patient_id", "microplanning_id"])
		.unique()
		.execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropIndex("idx_ws_microplanning_patient_targets_unique").on("ws_microplanning_patient_targets").execute()
	await db.schema.dropTable("ws_microplanning_patient_targets").execute()
}