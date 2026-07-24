import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .dropConstraint("fk_environmental_analysis_parameters_category_id")
    .execute()

  await db.schema
    .dropIndex("idx_environmental_analysis_parameters_category_id")
    .on("environmental_analysis_parameters")
    .execute()

  await db.schema
    .alterTable("environmental_analysis_parameters")
    .dropColumn("parameter_category_id")
    .dropColumn("quality_standard")
    .dropColumn("condition")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .addColumn("parameter_category_id", "bigint")
    .addColumn("quality_standard", "varchar(100)")
    .addColumn("condition", "varchar(50)")
    .execute()
}
