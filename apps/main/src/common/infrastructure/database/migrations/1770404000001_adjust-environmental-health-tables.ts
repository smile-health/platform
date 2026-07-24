import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // 1. Add columns to ws_environmental_tests
  await db.schema
    .alterTable("ws_environmental_tests")
    .addColumn("ikl_qualified", "boolean")
    .addColumn("ikl_test_date", "date")
    .addColumn("ikl_score", "decimal(10, 2)")
    .addColumn("inventory_id", "bigint")
    .execute()

  // Add index for inventory_id
  await db.schema
    .createIndex("idx_ws_environmental_tests_inventory_id")
    .on("ws_environmental_tests")
    .column("inventory_id")
    .execute()

  // Add Foreign Key for inventory_id
  await db.schema
    .alterTable("ws_environmental_tests")
    .addForeignKeyConstraint(
      "fk_ws_environmental_tests_inventory_id",
      ["inventory_id"],
      "ws_asset_inventories",
      ["id"]
    )
    .onDelete("set null")
    .onUpdate("cascade")
    .execute()

  // 2. Add Audit Columns to related tables if missing
  await db.schema
    .alterTable("environmental_parameter_categories")
    .addColumn("created_by", "bigint")
    .addColumn("updated_by", "bigint")
    .addColumn("deleted_by", "bigint")
    .execute()

  await db.schema
    .alterTable("environmental_analysis_parameters")
    .addColumn("created_by", "bigint")
    .addColumn("updated_by", "bigint")
    .addColumn("deleted_by", "bigint")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .dropColumn("created_by")
    .dropColumn("updated_by")
    .dropColumn("deleted_by")
    .execute()

  await db.schema
    .alterTable("environmental_parameter_categories")
    .dropColumn("created_by")
    .dropColumn("updated_by")
    .dropColumn("deleted_by")
    .execute()

  await db.schema
    .alterTable("ws_environmental_tests")
    .dropConstraint("fk_ws_environmental_tests_inventory_id")
    .execute()

  await db.schema
    .dropIndex("idx_ws_environmental_tests_inventory_id")
    .on("ws_environmental_tests")
    .execute()

  await db.schema
    .alterTable("ws_environmental_tests")
    .dropColumn("ikl_qualified")
    .dropColumn("ikl_test_date")
    .dropColumn("ikl_score")
    .dropColumn("inventory_id")
    .execute()
}
