import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  const columns = await db
    .selectFrom("information_schema.columns")
    .select("COLUMN_NAME")
    .where("TABLE_NAME", "=", "ws_map_routes")
    .execute()

  const existingColumns = new Set(columns.map((c) => c.COLUMN_NAME))

  let query = db.schema.alterTable("ws_map_routes")

  if (existingColumns.has("total_distance_meters")) {
    query = query.dropColumn("total_distance_meters")
  }

  if (existingColumns.has("total_duration_seconds")) {
    query = query.dropColumn("total_duration_seconds")
  }

  await query.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_map_routes")
    .addColumn("total_distance_meters", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("total_duration_seconds", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .execute()
}
