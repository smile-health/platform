import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_activity_environmental_parameter_categories")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("activity_id", "bigint", (col) => col.notNull())
    .addColumn("environmental_parameter_categories_id", "integer", (col) =>
      col.notNull()
    )
    .$call(addTimestampColumns)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropTable("ws_activity_environmental_parameter_categories")
    .execute()
}
