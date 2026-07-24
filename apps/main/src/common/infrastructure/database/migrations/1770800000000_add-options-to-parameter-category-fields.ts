import { type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_parameter_categories_fields")
    .addColumn("options", "text")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_parameter_categories_fields")
    .dropColumn("options")
    .execute()
}
