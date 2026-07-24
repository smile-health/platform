import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("executive_users")
    .modifyColumn("last_login", "timestamp")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("executive_users")
    .modifyColumn("last_login", "date")
    .execute()
}
