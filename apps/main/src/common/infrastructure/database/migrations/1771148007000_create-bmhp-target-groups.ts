import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("bmhp_target_groups")
    .addColumn("id", "integer", (col) =>
      col.autoIncrement().primaryKey().unsigned()
    )
    .addColumn("code", "varchar(50)", (col) => col.unique())
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("age_range", "varchar(50)")
    .addColumn("description", "text")
    .addColumn("is_active", "boolean", (col) => col.defaultTo(true))
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("bmhp_target_groups").execute()
}
