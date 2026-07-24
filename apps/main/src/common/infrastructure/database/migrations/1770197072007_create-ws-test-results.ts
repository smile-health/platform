import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_test_results")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("environmental_test_id", "bigint", (col) => col.notNull())
    .addColumn("analysis_parameter_id", "bigint")
    .addColumn("parameter_name", "varchar(255)", (col) => col.notNull())
    .addColumn("quality_standard", "varchar(100)")
    .addColumn("unit", "varchar(50)")
    .addColumn("test_methods_id", "bigint", (col) => col.notNull())
    .addColumn("result_value", "varchar(255)")
    .addColumn("is_custom", "boolean", (col) => col.notNull().defaultTo(false))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_ws_test_results_environmental_test_id")
    .on("ws_test_results")
    .column("environmental_test_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_test_results_analysis_parameter_id")
    .on("ws_test_results")
    .column("analysis_parameter_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_test_results_test_methods_id")
    .on("ws_test_results")
    .column("test_methods_id")
    .execute()

  await db.schema
    .alterTable("ws_test_results")
    .addForeignKeyConstraint(
      "fk_ws_test_results_environmental_test_id",
      ["environmental_test_id"],
      "ws_environmental_tests",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("ws_test_results")
    .addForeignKeyConstraint(
      "fk_ws_test_results_analysis_parameter_id",
      ["analysis_parameter_id"],
      "environmental_analysis_parameters",
      ["id"]
    )
    .onDelete("set null")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("ws_test_results")
    .addForeignKeyConstraint(
      "fk_ws_test_results_test_methods_id",
      ["test_methods_id"],
      "environmental_test_methods",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_test_results").execute()
}

