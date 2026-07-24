import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // 1. Create ws_test_inventories table
  await db.schema
    .createTable("ws_test_inventories")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("environmental_test_id", "bigint", (col) => col.notNull())
    .addColumn("inventory_id", "bigint", (col) => col.notNull())
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_ws_test_inventories_environmental_test_id")
    .on("ws_test_inventories")
    .column("environmental_test_id")
    .execute()

  await db.schema
    .createIndex("idx_ws_test_inventories_inventory_id")
    .on("ws_test_inventories")
    .column("inventory_id")
    .execute()

  await db.schema
    .alterTable("ws_test_inventories")
    .addForeignKeyConstraint(
      "fk_ws_test_inventories_environmental_test_id",
      ["environmental_test_id"],
      "ws_environmental_tests",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()

  await db.schema
    .alterTable("ws_test_inventories")
    .addForeignKeyConstraint(
      "fk_ws_test_inventories_inventory_id",
      ["inventory_id"],
      "ws_asset_inventories",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  // 1. Drop ws_test_inventories table
  await db.schema.dropTable("ws_test_inventories").execute()
}
