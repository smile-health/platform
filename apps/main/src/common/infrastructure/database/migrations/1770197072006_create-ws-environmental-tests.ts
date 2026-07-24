import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_environmental_tests")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("entity_id", "bigint", (col) => col.notNull())
    .addColumn("parameter_category_id", "bigint", (col) => col.notNull())
    .addColumn("test_material", "varchar(255)")
    .addColumn("packaging", "varchar(255)")
    .addColumn("brand", "varchar(255)")
    .addColumn("sample_id", "varchar(100)", (col) => col.notNull())
    .addColumn("received_date", "date", (col) => col.notNull())
    .addColumn("lab_result_status", "varchar(10)", (col) => col.notNull().defaultTo("pending"))
    .addColumn("test_start_date", "date")
    .addColumn("test_end_date", "date")
    .addColumn("sample_collected_by", "varchar(20)")
    .addColumn("location", "varchar(255)")
    .addColumn("collection_date", "date")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_ws_environmental_tests_entity_id")
    .on("ws_environmental_tests")
    .column("entity_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_environmental_tests_parameter_category_id")
    .on("ws_environmental_tests")
    .column("parameter_category_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_environmental_tests_sample_id")
    .on("ws_environmental_tests")
    .column("sample_id")
    .execute()

  await db.schema
    .alterTable("ws_environmental_tests")
    .addForeignKeyConstraint(
      "fk_ws_environmental_tests_parameter_category_id",
      ["parameter_category_id"],
      "environmental_parameter_categories",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_environmental_tests").execute()
}

