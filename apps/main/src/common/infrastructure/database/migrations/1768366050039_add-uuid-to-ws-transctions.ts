import type { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_transactions")
    .addColumn("uuid", "varchar(255)", (col) => col.unique())
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("ws_transactions").dropColumn("uuid").execute()
}
