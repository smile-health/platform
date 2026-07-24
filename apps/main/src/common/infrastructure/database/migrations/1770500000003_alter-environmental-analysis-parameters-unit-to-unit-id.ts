import { sql, type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  // 1. Add unit_id column
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .addColumn("unit_id", "bigint")
    .execute()

  // 2. Migrate data from unit (string) to unit_id (FK)
  // Match existing unit strings to environmental_units table
  await sql`
    UPDATE environmental_analysis_parameters eap
    INNER JOIN environmental_units eu ON eap.unit = eu.name
    SET eap.unit_id = eu.id
    WHERE eap.unit IS NOT NULL
  `.execute(db)

  // 3. Create index on unit_id
  await db.schema
    .createIndex("idx_environmental_analysis_parameters_unit_id")
    .on("environmental_analysis_parameters")
    .column("unit_id")
    .execute()

  // 4. Add foreign key constraint
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .addForeignKeyConstraint(
      "fk_environmental_analysis_parameters_unit_id",
      ["unit_id"],
      "environmental_units",
      ["id"]
    )
    .onDelete("set null")
    .onUpdate("cascade")
    .execute()

  // 5. Drop old unit column
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .dropColumn("unit")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  // 1. Add back unit column
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .addColumn("unit", "varchar(50)")
    .execute()

  // 2. Migrate data back from unit_id to unit string
  await sql`
    UPDATE environmental_analysis_parameters eap
    INNER JOIN environmental_units eu ON eap.unit_id = eu.id
    SET eap.unit = eu.name
    WHERE eap.unit_id IS NOT NULL
  `.execute(db)

  // 3. Drop foreign key constraint
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .dropConstraint("fk_environmental_analysis_parameters_unit_id")
    .execute()

  // 4. Drop index
  await db.schema
    .dropIndex("idx_environmental_analysis_parameters_unit_id")
    .on("environmental_analysis_parameters")
    .execute()

  // 5. Drop unit_id column
  await db.schema
    .alterTable("environmental_analysis_parameters")
    .dropColumn("unit_id")
    .execute()
}

