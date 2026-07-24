import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
    .alterTable("ws_microplanning_patient_targets")
    .addColumn("reff_id", "bigint")
    .addColumn("reff_type", "varchar(50)")
    .addColumn("subdistrict_id", "bigint")
    .addColumn("regency_id", "bigint")
    .addColumn("province_id", "bigint")
    .addColumn("status", sql`tinyint(1)`, (col) => col.notNull().defaultTo(0))
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("ws_microplanning_patient_targets")
		.dropColumn("reff_id")
		.dropColumn("reff_type")
		.dropColumn("subdistrict_id")
		.dropColumn("regency_id")
		.dropColumn("province_id")
		.dropColumn("status")
		.execute()
}
