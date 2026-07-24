import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_microplanning_activity_plans")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("microplanning_id", "bigint", (col) => col.notNull())
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("objective", "text", (col) => col)
    .addColumn("frequency_id", "integer", (col) => col)
    .addColumn("target_group_ids", "json", (col) => col)
    .addColumn("location_type_ids", "json", (col) => col)
    .addColumn("implementation_schedule", "text", (col) => col)
    .addColumn("material_ids", "json", (col) => col)
    .addColumn("budget_estimation", "double precision", (col) => col)
    .addColumn("budget_source_ids", "json", (col) => col)
    .addColumn("other_budget_source_name", "varchar(255)", (col) => col)
    .addColumn("additional_information", "text", (col) => col)
    .addColumn("number_of_vaccinator", "smallint", (col) => col)
    .addColumn("pics", "text", (col) => col)
    .addColumn("is_mandatory", sql`tinyint(1)`, (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn("status", sql`tinyint(1)`, (col) => col.notNull().defaultTo(0))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addForeignKeyConstraint(
      "fk_activity_plans_microplanning",
      ["microplanning_id"],
      "ws_microplanning",
      ["id"],
      (cb) => cb.onDelete("cascade")
    )
    .execute()

  // Create indexes
  await db.schema
    .createIndex("idx_activity_plans_microplanning")
    .on("ws_microplanning_activity_plans")
    .column("microplanning_id")
    .execute()

  await db.schema
    .createIndex("idx_activity_plans_mandatory")
    .on("ws_microplanning_activity_plans")
    .column("is_mandatory")
    .execute()

  await db.schema
    .createIndex("idx_activity_plans_status")
    .on("ws_microplanning_activity_plans")
    .column("status")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropTable("ws_microplanning_activity_plans")
    .ifExists()
    .execute()
}
