import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_microplan_targets_consumptions")
		.addColumn("patient_id", "bigint")
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_microplan_targets_consumptions")
		.dropColumn("patient_id")
		.execute()
}
