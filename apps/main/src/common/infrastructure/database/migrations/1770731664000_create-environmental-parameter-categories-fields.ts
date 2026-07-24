import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("environmental_parameter_categories_fields")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("environmental_parameter_categories_id", "bigint", (col) =>
      col.notNull()
    )
    .addColumn("key", "varchar(100)", (col) => col.notNull())
    .addColumn("type_data", "varchar(100)", (col) => col.notNull())
    .addColumn("label", "varchar(100)", (col) => col.notNull())
    .addColumn("hint", "varchar(100)")
    .addColumn("mandatory", "integer", (col) => col.notNull())
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("idx_env_param_cat_fields_category_id")
    .on("environmental_parameter_categories_fields")
    .column("environmental_parameter_categories_id")
    .execute()

  await db.schema
    .alterTable("environmental_parameter_categories_fields")
    .addForeignKeyConstraint(
      "fk_env_param_cat_fields_category_id",
      ["environmental_parameter_categories_id"],
      "environmental_parameter_categories",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropTable("environmental_parameter_categories_fields")
    .execute()
}

