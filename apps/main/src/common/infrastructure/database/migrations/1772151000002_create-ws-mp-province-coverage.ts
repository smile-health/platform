import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_mp_province_coverage")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("mp_material_target_config_id", "bigint", (col) =>
      col.notNull()
    )
    .addColumn("province_id", "bigint", (col) => col.notNull())
    .addColumn("coverage_number", "double precision", (col) =>
      col.notNull().defaultTo(0)
    )
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .alterTable("ws_mp_province_coverage")
    .addForeignKeyConstraint(
      "ws_mp_pc_material_target_config_fk",
      ["mp_material_target_config_id"],
      "ws_mp_material_target_config",
      ["id"]
    )
    .onDelete("restrict")
    .execute()

  await sql`
    ALTER TABLE ws_mp_province_coverage
    ADD UNIQUE KEY ws_mp_pc_unique_material_province (mp_material_target_config_id, province_id)
  `.execute(db)

  await db.schema
    .createIndex("ws_mp_pc_material_target_idx")
    .on("ws_mp_province_coverage")
    .column("mp_material_target_config_id")
    .execute()

  await db.schema
    .createIndex("ws_mp_pc_province_idx")
    .on("ws_mp_province_coverage")
    .column("province_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_mp_province_coverage").execute()
}
