import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_map_service_points")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("microplanning_id", "bigint", (col) => col.notNull())
    .addColumn("entity_id", "bigint", (col) => col.notNull())
    .addColumn("latitude", sql`decimal(10,7)`, (col) => col.notNull())
    .addColumn("longitude", sql`decimal(10,7)`, (col) => col.notNull())
    .addColumn("status", sql`tinyint(1)`, (col) => col.notNull().defaultTo(0))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addForeignKeyConstraint(
      "fk_ws_map_service_points_microplanning",
      ["microplanning_id"],
      "ws_microplanning",
      ["id"],
      (cb) => cb.onDelete("cascade").onUpdate("cascade")
    )
    .execute()

  await db.schema
    .createIndex("idx_ws_map_service_points_microplanning_id")
    .on("ws_map_service_points")
    .column("microplanning_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_map_service_points").execute()
}
