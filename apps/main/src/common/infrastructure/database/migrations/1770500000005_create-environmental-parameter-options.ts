import { type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // Create environmental_parameter_options table
  await db.schema
    .createTable("environmental_parameter_options")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("analysis_parameter_id", "bigint", (col) => col.notNull())
    .addColumn("option_value", "varchar(255)", (col) => col.notNull())
    .addColumn("sort_order", "integer", (col) => col.defaultTo(0))
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("deleted_at", "timestamp")
    .execute()

  // Add foreign key
  await db.schema
    .alterTable("environmental_parameter_options")
    .addForeignKeyConstraint(
      "fk_options_analysis_parameter_id",
      ["analysis_parameter_id"],
      "environmental_analysis_parameters",
      ["id"]
    )
    .onDelete("cascade")
    .execute()

  // Add index for analysis_parameter_id
  await db.schema
    .createIndex("idx_options_analysis_parameter_id")
    .on("environmental_parameter_options")
    .column("analysis_parameter_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("environmental_parameter_options").execute()
}

