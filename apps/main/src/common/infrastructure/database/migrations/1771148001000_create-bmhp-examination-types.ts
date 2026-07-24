import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("bmhp_examination_types")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey().unsigned())
    .addColumn("name", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("description", "text")
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("bmhp_examination_types").execute()
}
