import type { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("entities").dropColumn("integration_type").execute()
  await db.schema
    .alterTable("entity_types")
    .dropColumn("integration_type")
    .execute()
  await db.schema
    .alterTable("entity_tags")
    .dropColumn("integration_type")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("entities")
    .addColumn("integration_type", "integer")
    .execute()
  await db.schema
    .alterTable("entity_types")
    .addColumn("integration_type", "integer")
    .execute()
  await db.schema
    .alterTable("entity_tags")
    .addColumn("integration_type", "integer")
    .execute()
}
