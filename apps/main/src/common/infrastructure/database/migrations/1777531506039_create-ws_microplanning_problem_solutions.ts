import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_microplanning_problem_solutions")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("microplanning_id", "bigint", (col) => col.notNull())
    .addColumn("village_id", "bigint", (col) => col.notNull())
    .addColumn("problem_type_id", "integer", (col) => col.notNull())
    .addColumn("problem_category_id", "integer", (col) => col.notNull())
    .addColumn("problem_category_name", "varchar(255)", (col) => col)
    .addColumn("solution", "text", (col) => col)
    .addColumn("status", sql`tinyint(1)`, (col) => col.notNull().defaultTo(0))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addForeignKeyConstraint(
      "fk_microplanning_problem_solutions_microplanning",
      ["microplanning_id"],
      "ws_microplanning",
      ["id"],
      (cb) => cb.onDelete("cascade")
    )
    .addForeignKeyConstraint(
      "fk_microplanning_problem_solutions_village",
      ["village_id"],
      "locations",
      ["id"],
      (cb) => cb.onDelete("restrict")
    )
    .execute()

  // Create indexes
  await db.schema
    .createIndex("idx_microplanning_village")
    .on("ws_microplanning_problem_solutions")
    .columns(["microplanning_id", "village_id"])
    .execute()

  await db.schema
    .createIndex("idx_problem_type")
    .on("ws_microplanning_problem_solutions")
    .column("problem_type_id")
    .execute()

  await db.schema
    .createIndex("idx_problem_category")
    .on("ws_microplanning_problem_solutions")
    .column("problem_category_id")
    .execute()

  await db.schema
    .createIndex("idx_status")
    .on("ws_microplanning_problem_solutions")
    .column("status")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .dropTable("ws_microplanning_problem_solutions")
    .ifExists()
    .execute()
}
