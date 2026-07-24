import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_examination_target_materials")
    .addColumn("id", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    // .addColumn("exam_id", "integer")
    .addColumn("exam_target_group_id", "integer")
    .addColumn("bmhp_material_id", "integer")
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  // Create indexes for better query performance
  await db.schema
    .createIndex("ws_bmhp_examination_target_materials_exam_target_group_id_index")
    .on("ws_bmhp_examination_target_materials")
    .column("exam_target_group_id")
    .execute()

  await db.schema
    .createIndex("ws_bmhp_examination_target_materials_bmhp_material_id_index")
    .on("ws_bmhp_examination_target_materials")
    .column("bmhp_material_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_examination_target_materials").execute()
}
