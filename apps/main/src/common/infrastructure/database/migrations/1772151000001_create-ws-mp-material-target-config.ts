import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_mp_material_target_config")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("mp_program_config_id", "bigint", (col) => col.notNull())
    .addColumn("material_id", "bigint", (col) => col.notNull())
    .addColumn("target_group_id", "integer", (col) => col.notNull())
    .addColumn("category", sql`ENUM('non_bias','bias')`, (col) => col.notNull())
    .addColumn(
      "type",
      sql`ENUM('primary','additional','immunization')`,
      (col) => col.notNull()
    )
    .addColumn("injection_month", "varchar(20)")
    .addColumn("ip", "double precision", (col) =>
      col.notNull().defaultTo(95)
    )
    .addColumn("number_of_dose", "double precision", (col) =>
      col.notNull().defaultTo(1)
    )
    .addColumn("month_distribution", "text")
    .addColumn("start_ideal_days", "bigint")
    .addColumn("end_ideal_days", "bigint")
    .addColumn("restricted_ideal_day", "bigint")
    .addColumn("parent_id", "bigint")
    .addColumn("material_target_ref_id", "bigint")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .alterTable("ws_mp_material_target_config")
    .addForeignKeyConstraint(
      "ws_mp_mtc_program_config_fk",
      ["mp_program_config_id"],
      "ws_mp_program_config",
      ["id"]
    )
    .onDelete("restrict")
    .execute()

  await db.schema
    .alterTable("ws_mp_material_target_config")
    .addForeignKeyConstraint(
      "ws_mp_mtc_parent_fk",
      ["parent_id"],
      "ws_mp_material_target_config",
      ["id"]
    )
    .onDelete("set null")
    .execute()

  await db.schema
    .createIndex("ws_mp_mtc_program_config_idx")
    .on("ws_mp_material_target_config")
    .column("mp_program_config_id")
    .execute()

  await db.schema
    .createIndex("ws_mp_mtc_material_idx")
    .on("ws_mp_material_target_config")
    .columns(["material_id", "target_group_id"])
    .execute()

  await db.schema
    .createIndex("ws_mp_mtc_deleted_idx")
    .on("ws_mp_material_target_config")
    .column("deleted_at")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_mp_material_target_config").execute()
}
