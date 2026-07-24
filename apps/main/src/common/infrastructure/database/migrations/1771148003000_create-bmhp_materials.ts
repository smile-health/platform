import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"
import { addAuditColumns, addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("bmhp_materials")
    .addColumn("id", "integer", (col) =>
      col.autoIncrement().primaryKey().unsigned()
    )
    .addColumn("name", "varchar(150)", (col) => col.notNull())
    .addColumn("is_reagen", "boolean", (col) => col.defaultTo(null))
    .addColumn("description", "text")
    .addColumn("is_active", "boolean", (col) => col.defaultTo(true))
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("bmhp_materials").execute()
}
