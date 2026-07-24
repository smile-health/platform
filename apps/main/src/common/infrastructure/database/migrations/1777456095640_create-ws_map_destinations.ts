import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_map_destinations")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("microplanning_id", "bigint", (col) => col.notNull())
    .addColumn("service_point_id", "bigint", (col) => col.notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("type", "varchar(25)", (col) => col.notNull())
    .addColumn("sub_type", "varchar(25)", (col) => col.notNull())
    .addColumn("latitude", sql`decimal(10,7)`, (col) => col.notNull())
    .addColumn("longitude", sql`decimal(10,7)`, (col) => col.notNull())
    .addColumn("distance_meters", sql`decimal(10,2)`, (col) => col.notNull())
    .addColumn("road_type", "varchar(10)", (col) => col.notNull())
    .addColumn("notes", "text")
    .addColumn("status", sql`tinyint(1)`, (col) => col.notNull().defaultTo(0))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addForeignKeyConstraint(
      "fk_ws_map_destinations_microplanning",
      ["microplanning_id"],
      "ws_microplanning",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .addForeignKeyConstraint(
      "fk_ws_map_destinations_service_point",
      ["service_point_id"],
      "ws_map_service_points",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .execute()

  await db.schema
    .createIndex("idx_ws_map_destinations_microplanning_id")
    .on("ws_map_destinations")
    .column("microplanning_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_map_destinations_service_point_id")
    .on("ws_map_destinations")
    .column("service_point_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_map_destinations").execute()
}
