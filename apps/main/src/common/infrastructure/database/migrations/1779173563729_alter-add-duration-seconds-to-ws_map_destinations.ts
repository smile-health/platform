import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_map_destinations")
    .addColumn("duration_seconds", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_map_destinations")
    .dropColumn("duration_seconds")
    .execute()
}
