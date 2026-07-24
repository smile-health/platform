import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // 1. Drop ForeignKey that depends on environmental_test_methods (ignore if already dropped)
  try {
    await db.schema
      .alterTable("ws_test_results")
      .dropConstraint("fk_ws_test_results_test_methods_id")
      .execute()
  } catch {
    // Constraint may already have been dropped in a previous partial run
  }

  // 2. Drop old tables
  await db.schema.dropTable("environmental_test_methods").ifExists().execute()
  await db.schema
    .dropTable("environmental_analysis_parameter_test_methods")
    .ifExists()
    .execute()

  // 3. Create new environmental_test_methods table
  await db.schema
    .createTable("environmental_test_methods")
    .ifNotExists()
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("name", "varchar(255)")
    .addColumn("deskripsi", "varchar(255)")
    .addColumn("quality_standard", "varchar(255)")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  // 4. Clean up orphaned rows in ws_test_results
  await db
    .deleteFrom("ws_test_results" as any)
    .where("test_methods_id" as any, "not in", (qb: any) =>
      qb.selectFrom("environmental_test_methods" as any).select("id" as any)
    )
    .execute()

  // 5. Re-add ForeignKey in ws_test_results
  await db.schema
    .alterTable("ws_test_results")
    .addForeignKeyConstraint(
      "fk_ws_test_results_test_methods_id",
      ["test_methods_id"],
      "environmental_test_methods",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Down migration is complex because we are restructuring.
  // For simplicity, we drop and restore the old structure if possible,
  // but note that data might be lost.

  await db.schema
    .alterTable("ws_test_results")
    .dropConstraint("fk_ws_test_results_test_methods_id")
    .execute()

  await db.schema.dropTable("environmental_test_methods").execute()

  // Restore environmental_analysis_parameter_test_methods
  await db.schema
    .createTable("environmental_analysis_parameter_test_methods")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("name", "varchar(255)")
    .addColumn("deskripsi", "varchar(255)")
    .$call(addTimestampColumns)
    .execute()

  // Restore environmental_test_methods (old structure)
  await db.schema
    .createTable("environmental_test_methods")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("analysis_parameters_id", "bigint", (col) => col.notNull())
    .addColumn("analysis_parameter_test_methods_id", "bigint", (col) =>
      col.notNull()
    )
    .addColumn("deskripsi", "varchar(255)")
    .$call(addTimestampColumns)
    .execute()

  // Re-add FK in ws_test_results (pointing to the restored old table)
  await db.schema
    .alterTable("ws_test_results")
    .addForeignKeyConstraint(
      "fk_ws_test_results_test_methods_id",
      ["test_methods_id"],
      "environmental_test_methods",
      ["id"]
    )
    .onDelete("cascade")
    .onUpdate("cascade")
    .execute()
}
