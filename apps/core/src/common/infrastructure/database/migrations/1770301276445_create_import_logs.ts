import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"
import { addTimestampColumns } from "../helper.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // migration table import categories
  await db.schema
    .createTable("import_categories")
    .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("category_name", "varchar(255)", (col) => col.notNull())
    .$call(addTimestampColumns)
    .execute()

  // migration table import_logs
  await db.schema
    .createTable("import_logs")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("user_id", "bigint", (col) => col.notNull())
    .addColumn("program_id", "integer")
    .addColumn("progress", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("category_id", "integer", (col) =>
      col.notNull().references("import_categories.id")
    )
    .addColumn("on_progress", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .$call(addTimestampColumns)
    .execute()

  // Seeder for import_categories
  await db
    .insertInto("import_categories" as any)
    .values([{ category_name: "entities" }])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("import_logs").execute()
  await db.schema.dropTable("import_categories").execute()
}
