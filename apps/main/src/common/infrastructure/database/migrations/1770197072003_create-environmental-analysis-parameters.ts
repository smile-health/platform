import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("environmental_analysis_parameters")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("parameter_category_id", "bigint", (col) => col.notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("quality_standard", "varchar(100)")
    .addColumn("unit", "varchar(50)")
    .addColumn("result_data_type", "varchar(20)", (col) => col.notNull())
    .addColumn("condition", "varchar(50)")
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_environmental_analysis_parameters_category_id")
    .on("environmental_analysis_parameters")
    .column("parameter_category_id")
    .execute()

  await db.schema
    .alterTable("environmental_analysis_parameters")
    .addForeignKeyConstraint(
      "fk_environmental_analysis_parameters_category_id",
      ["parameter_category_id"],
      "environmental_parameter_categories",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("environmental_analysis_parameters").execute()
}

