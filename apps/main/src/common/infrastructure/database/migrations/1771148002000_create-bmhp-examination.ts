import { sql, Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("bmhp_examinations")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey().unsigned())
    .addColumn("examination_type_id", "integer", (col) =>
      col.unsigned().references("bmhp_examination_types.id")
    )
    .addColumn("name", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("description", "text")
    .addColumn("is_active", "boolean", (col) =>
      col.notNull().defaultTo(sql`true`)
    )
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("bmhp_examinations").execute()
}
