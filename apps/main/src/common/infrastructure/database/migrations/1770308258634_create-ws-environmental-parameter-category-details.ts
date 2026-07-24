import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_environmental_parameter_category_details")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("env_parameter_category_id", "bigint", (col) => col.notNull())
    .addColumn("env_analysis_parameter_id", "bigint", (col) => col.notNull())
    .addColumn("quality_standard", "varchar(100)")
    .addColumn("result", "varchar(100)")
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_ws_env_param_cat_details_category_id")
    .on("ws_environmental_parameter_category_details")
    .column("env_parameter_category_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_env_param_cat_details_parameter_id")
    .on("ws_environmental_parameter_category_details")
    .column("env_analysis_parameter_id")
    .execute()

  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .addForeignKeyConstraint(
      "fk_ws_env_param_cat_details_category_id",
      ["env_parameter_category_id"],
      "environmental_parameter_categories",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .addForeignKeyConstraint(
      "fk_ws_env_param_cat_details_parameter_id",
      ["env_analysis_parameter_id"],
      "environmental_analysis_parameters",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropTable("ws_environmental_parameter_category_details")
    .execute()
}
