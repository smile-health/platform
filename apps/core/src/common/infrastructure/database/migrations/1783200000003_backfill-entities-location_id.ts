import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

// Backfills entities.location_id from the deepest non-null/non-empty flat
// location column (village_id > sub_district_id > regency_id > province_id).
export async function up(db: Kysely<Database>): Promise<void> {
  await sql`
    UPDATE entities
    SET location_id = CAST(
      COALESCE(
        NULLIF(village_id, ''),
        NULLIF(sub_district_id, ''),
        NULLIF(regency_id, ''),
        NULLIF(province_id, '')
      ) AS UNSIGNED
    )
    WHERE location_id IS NULL
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`
    UPDATE entities SET location_id = NULL
  `.execute(db)
}
