import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // 1. Drop columns
  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .dropColumn("quality_standard")
    .dropColumn("result")
    .execute()

  // 2. Add new columns
  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .addColumn("env_test_method_id", "bigint")
    .addColumn("created_by", "bigint")
    .addColumn("updated_by", "bigint")
    .addColumn("deleted_by", "bigint")
    .execute()

  // 3. Add Index
  await db.schema
    .createIndex("idx_ws_env_param_cat_details_test_method_id")
    .on("ws_environmental_parameter_category_details")
    .column("env_test_method_id")
    .execute()

  // 4. Add ForeignKey
  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .addForeignKeyConstraint(
      "fk_ws_env_param_cat_details_test_method_id",
      ["env_test_method_id"],
      "environmental_test_methods",
      ["id"]
    )
    .onDelete("set null")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .dropConstraint("fk_ws_env_param_cat_details_test_method_id")
    .execute()

  await db.schema
    .dropIndex("idx_ws_env_param_cat_details_test_method_id")
    .on("ws_environmental_parameter_category_details")
    .execute()

  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .dropColumn("env_test_method_id")
    .dropColumn("created_by")
    .dropColumn("updated_by")
    .dropColumn("deleted_by")
    .execute()

  await db.schema
    .alterTable("ws_environmental_parameter_category_details")
    .addColumn("quality_standard", "varchar(100)")
    .addColumn("result", "varchar(100)")
    .execute()
}
