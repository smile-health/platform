import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("executive_user_changelogs")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("user_id", "bigint", (col) => col.notNull())
    .addColumn("field", "varchar(255)", (col) => col.notNull())
    .addColumn("old_value", "varchar(255)")
    .addColumn("new_value", "varchar(255)")
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  await db.schema
    .createIndex("idx_executive_user_changelogs_user_id")
    .on("executive_user_changelogs")
    .column("user_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("executive_user_changelogs").execute()
}
