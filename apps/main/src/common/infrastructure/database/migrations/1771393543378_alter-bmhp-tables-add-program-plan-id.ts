import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"

const tables = [
  "bmhp_examinations",
  "bmhp_examination_types",
  "bmhp_parameters",
] as const

export async function up(db: Kysely<Database>): Promise<void> {
  for (const table of tables) {
    await db.schema
      .alterTable(table)
      .addColumn("program_plan_id", "integer", (col) =>
        col.unsigned().references("ws_program_plans.id")
      )
      .execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  for (const table of tables) {
    await db.schema.alterTable(table).dropColumn("program_plan_id").execute()
  }
}
