import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_bmhp_planning_materials")
		.addColumn("variant_id", "bigint")
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_bmhp_planning_materials")
		.dropColumn("variant_id")
		.execute()
}
