import { sql, type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_parameter_categories")
    .addColumn(
      "status",
      sql`tinyint(1) not null default 1 after name`
    )
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_parameter_categories")
    .dropColumn("status")
    .execute()
}
