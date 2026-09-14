import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("locations")
    .addColumn("path", "varchar(255)")
    .execute()

  // varchar index prefix length follows the same style as
  // 1758621795581_add-index-entities-locations.ts (prefix-length indexes on varchar columns)
  await sql`
    ALTER TABLE locations ADD INDEX idx_path (path(191));
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("idx_path").execute()
  await db.schema.alterTable("locations").dropColumn("path").execute()
}
