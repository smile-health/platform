import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_environmental_tests_detail")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("environmental_test_id", "bigint", (col) => col.notNull())
    .addColumn("entity_id", "bigint", (col) => col.notNull())
    .addColumn("is_transaction", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("transaction_id", "bigint")
    .$call(addTimestampColumns)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_environmental_tests_detail").execute()
}