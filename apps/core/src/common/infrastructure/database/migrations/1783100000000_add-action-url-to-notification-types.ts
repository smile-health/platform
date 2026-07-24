import type { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("notification_types")
    .addColumn("action_url", "varchar(1000)")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("notification_types")
    .dropColumn("action_url")
    .execute()
}
