import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_bmhp_approval_periods")
		.addColumn("approval_signature_id", "bigint")
		.execute()

	await db.schema
		.alterTable("ws_bmhp_desk_results")
		.addColumn("approval_signature_id", "bigint")
		.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_bmhp_desk_results")
		.dropColumn("approval_signature_id")
		.execute()

	await db.schema
		.alterTable("ws_bmhp_approval_periods")
		.dropColumn("approval_signature_id")
		.execute()
}
