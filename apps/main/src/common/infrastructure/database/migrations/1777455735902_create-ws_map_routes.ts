import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_map_routes")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("microplanning_id", "bigint", (col) => col.notNull())
    .addColumn("service_point_id", "bigint", (col) => col.notNull())
    .addColumn("total_distance_meters", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("total_duration_seconds", sql`decimal(10,2)`, (col) =>
      col.notNull()
    )
    .addColumn("status", sql`tinyint(1)`, (col) => col.notNull().defaultTo(0))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addForeignKeyConstraint(
      "fk_ws_map_routes_microplanning",
      ["microplanning_id"],
      "ws_microplanning",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .addForeignKeyConstraint(
      "fk_ws_map_routes_service_point",
      ["service_point_id"],
      "ws_map_service_points",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .execute()

  await db.schema
    .createIndex("idx_ws_map_routes_microplanning_id")
    .on("ws_map_routes")
    .column("microplanning_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_map_routes_service_point_id")
    .on("ws_map_routes")
    .column("service_point_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_map_routes").execute()
}
