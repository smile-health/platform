import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  const result = await sql`SHOW INDEX FROM entities WHERE Key_name = 'idx_entities_province_regency_sub_district_id'`.execute(db)
  if (result.rows.length === 0) {
    await db.schema
      .createIndex("idx_entities_province_regency_sub_district_id")
      .on("entities")
      .columns(["province_id", "regency_id", "sub_district_id"])
      .execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("idx_entities_province_regency").execute()
}
