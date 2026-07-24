import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  const columns = await db
    .selectFrom("information_schema.columns")
    .select("COLUMN_NAME")
    .where("TABLE_NAME", "=", "ws_map_route_stops")
    .execute()

  const existingColumns = new Set(columns.map((c) => c.COLUMN_NAME))

  let query = db.schema.alterTable("ws_map_route_stops")

  if (existingColumns.has("distance_from_prev_meters")) {
    query = query.dropColumn("distance_from_prev_meters")
  }

  if (existingColumns.has("duration_from_prev_seconds")) {
    query = query.dropColumn("duration_from_prev_seconds")
  }

  if (existingColumns.has("stop_order")) {
    query = query.dropColumn("stop_order")
  }

  if (existingColumns.has("road_type")) {
    query = query.dropColumn("road_type")
  }

  await query.execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_map_route_stops")
    .addColumn("stop_order", "integer", (col) => col.notNull())
    .addColumn("distance_from_prev_meters", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("duration_from_prev_seconds", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("road_type", "varchar(7)", (col) => col.notNull())
    .execute()
}
