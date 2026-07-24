import { type Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // Drop existing foreign key constraint
  await db.schema
    .alterTable("environmental_parameter_options")
    .dropConstraint("fk_options_analysis_parameter_id")
    .execute()

  // Drop existing index
  await db.schema
    .dropIndex("idx_options_analysis_parameter_id")
    .on("environmental_parameter_options")
    .execute()

  // Rename column analysis_parameter_id to test_method_id
  await sql`
    ALTER TABLE environmental_parameter_options 
    CHANGE COLUMN analysis_parameter_id test_method_id BIGINT NOT NULL
  `.execute(db)

  // Add new foreign key constraint to environmental_test_methods
  await db.schema
    .alterTable("environmental_parameter_options")
    .addForeignKeyConstraint(
      "fk_options_test_method_id",
      ["test_method_id"],
      "environmental_test_methods",
      ["id"]
    )
    .onDelete("cascade")
    .execute()

  // Add new index for test_method_id
  await db.schema
    .createIndex("idx_options_test_method_id")
    .on("environmental_parameter_options")
    .column("test_method_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop new foreign key constraint
  await db.schema
    .alterTable("environmental_parameter_options")
    .dropConstraint("fk_options_test_method_id")
    .execute()

  // Drop new index
  await db.schema
    .dropIndex("idx_options_test_method_id")
    .on("environmental_parameter_options")
    .execute()

  // Rename column test_method_id back to analysis_parameter_id
  await sql`
    ALTER TABLE environmental_parameter_options 
    CHANGE COLUMN test_method_id analysis_parameter_id BIGINT NOT NULL
  `.execute(db)

  // Add back original foreign key constraint
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

  // Add back original index
  await db.schema
    .createIndex("idx_options_analysis_parameter_id")
    .on("environmental_parameter_options")
    .column("analysis_parameter_id")
    .execute()
}

