import { type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // Create environmental_parameter_validation_rules table
  await db.schema
    .createTable("environmental_parameter_validation_rules")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("analysis_parameter_id", "bigint", (col) => col.notNull())
    .addColumn("result_format_type", "varchar(20)")
    .addColumn("validation_type", "varchar(20)", (col) => col.notNull())
    .addColumn("min_value", "decimal(15, 4)")
    .addColumn("max_value", "decimal(15, 4)")
    .addColumn("comparison_operator", "varchar(10)")
    .addColumn("comparison_value", "decimal(15, 4)")
    .addColumn("allow_decimal", "boolean", (col) => col.defaultTo(false))
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("deleted_at", "timestamp")
    .execute()

  // Add foreign key
  // await db.schema
  //   .alterTable("environmental_parameter_validation_rules")
  //   .addForeignKeyConstraint(
  //     "fk_validation_rules_analysis_parameter_id",
  //     ["analysis_parameter_id"],
  //     "environmental_analysis_parameters",
  //     ["id"]
  //   )
  //   .onDelete("cascade")
  //   .execute()

  // Add index for analysis_parameter_id
  await db.schema
    .createIndex("idx_validation_rules_analysis_parameter_id")
    .on("environmental_parameter_validation_rules")
    .column("analysis_parameter_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropTable("environmental_parameter_validation_rules")
    .execute()
}

