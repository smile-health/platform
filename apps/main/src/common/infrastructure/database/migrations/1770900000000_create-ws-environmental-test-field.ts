import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_environmental_test_field")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("environmental_test_id", "bigint", (col) => col.notNull())
    .addColumn("key", "varchar(100)", (col) => col.notNull())
    .addColumn("label", "varchar(100)", (col) => col.notNull())
    .addColumn("value", "text")
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_ws_env_test_field_test_id")
    .on("ws_environmental_test_field")
    .column("environmental_test_id")
    .execute()

  await db.schema
    .alterTable("ws_environmental_test_field")
    .addForeignKeyConstraint(
      "fk_ws_env_test_field_test_id",
      ["environmental_test_id"],
      "ws_environmental_tests",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_environmental_test_field").execute()
}

