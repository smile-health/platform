import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_map_route_stops")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("route_id", "bigint", (col) => col.notNull())
    .addColumn("destination_id", "bigint", (col) => col.notNull())
    .addColumn("stop_order", "integer", (col) => col.notNull())
    .addColumn("distance_from_prev_meters", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("duration_from_prev_seconds", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("road_type", "varchar(7)", (col) => col.notNull())
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addForeignKeyConstraint(
      "fk_ws_map_route_stops_route",
      ["route_id"],
      "ws_map_routes",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .addForeignKeyConstraint(
      "fk_ws_map_route_stops_destination",
      ["destination_id"],
      "ws_map_destinations",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .execute()

  await db.schema
    .createIndex("idx_ws_map_route_stops_route_id")
    .on("ws_map_route_stops")
    .column("route_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_map_route_stops_destination_id")
    .on("ws_map_route_stops")
    .column("destination_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_map_route_stops").execute()
}
