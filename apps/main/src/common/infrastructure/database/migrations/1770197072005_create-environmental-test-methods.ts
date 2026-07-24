import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("environmental_test_methods")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("analysis_parameters_id", "bigint", (col) => col.notNull())
    .addColumn("analysis_parameter_test_methods_id", "bigint", (col) => col.notNull())
    .addColumn("deskripsi", "varchar(255)")
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_environmental_test_methods_analysis_parameters_id")
    .on("environmental_test_methods")
    .column("analysis_parameters_id")
    .execute()

  await db.schema
    .createIndex("idx_environmental_test_methods_test_methods_id")
    .on("environmental_test_methods")
    .column("analysis_parameter_test_methods_id")
    .execute()

  await db.schema
    .alterTable("environmental_test_methods")
    .addForeignKeyConstraint(
      "fk_environmental_test_methods_analysis_parameters_id",
      ["analysis_parameters_id"],
      "environmental_analysis_parameters",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("environmental_test_methods")
    .addForeignKeyConstraint(
      "fk_environmental_test_methods_test_methods_id",
      ["analysis_parameter_test_methods_id"],
      "environmental_analysis_parameter_test_methods",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("environmental_test_methods").execute()
}

