import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .modifyColumn("parameter_category_id", "bigint")
    .modifyColumn("quality_standard", "varchar(100)")
    .modifyColumn("result_data_type", "varchar(20)", (col) =>
      col.defaultTo("Free Text")
    )
    .modifyColumn("condition", "varchar(50)")
    .execute()

  // Update existing data to default if necessary
  await sql`UPDATE environmental_analysis_parameters SET result_data_type = 'Free Text' WHERE result_data_type IS NULL`.execute(
    db
  )
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .modifyColumn("parameter_category_id", "bigint", (col) => col.notNull())
    .modifyColumn("quality_standard", "varchar(100)")
    .modifyColumn("result_data_type", "varchar(20)", (col) => col.notNull())
    .modifyColumn("condition", "varchar(50)")
    .execute()
}
