import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

// No DB-level FK constraint, matching this codebase's existing convention
// (locations.parent_id, entities' current province/regency/sub_district/
// village_id columns, and every other "*_id" column referencing locations
// are plain indexed columns without FK constraints).
export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("entities")
    .addColumn("location_id", "bigint")
    .execute()

  await sql`
    ALTER TABLE entities ADD INDEX idx_entities_location_id (location_id);
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("idx_entities_location_id").execute()
  await db.schema.alterTable("entities").dropColumn("location_id").execute()
}
