import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_material_details")
    .addColumn("id", "integer", (col) =>
      col.autoIncrement().primaryKey().unsigned()
    )
    .addColumn("bmhp_material_id", "integer", (col) => col.notNull().unsigned())
    .addColumn("material_id", "integer", (col) => col.notNull().unsigned())
    .addColumn("material_level_id", "integer")
    .addColumn("test_qty_per_package", "integer")
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  // Create indexes for better query performance
  await db.schema
    .createIndex("ws_bmhp_material_details_bmhp_material_id_index")
    .on("ws_bmhp_material_details")
    .column("bmhp_material_id")
    .execute()

  await db.schema
    .createIndex("ws_bmhp_material_details_material_id_index")
    .on("ws_bmhp_material_details")
    .column("material_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_material_details").execute()
}
