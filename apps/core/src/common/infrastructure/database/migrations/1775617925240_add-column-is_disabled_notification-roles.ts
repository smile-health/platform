import { Kysely, sql } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
	// Add is_disabled_notification column to roles
	await sql`ALTER TABLE roles ADD COLUMN is_disabled_notification TINYINT DEFAULT 0 AFTER name`.execute(db)

	await db.updateTable("roles")
		.set({
			is_disabled_notification: 1
		})
		.where("id", "in", [9, 11, 15])
		.execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable("roles")
		.dropColumn("is_disabled_notification")
		.execute()
}