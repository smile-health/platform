import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"

const tables = [
  "bmhp_examination_types",
  "bmhp_examinations",
  "bmhp_examination_methods",
] as const

export async function up(db: Kysely<Database>): Promise<void> {
  for (const table of tables) {
    await db.schema.alterTable(table).dropIndex("name").execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  for (const table of tables) {
    await db.schema
      .alterTable(table)
      .addUniqueConstraint(`${table}_name_unique`, ["name"])
      .execute()
  }
}
