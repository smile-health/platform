import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_material_activities")
    .addUniqueConstraint("unique_constraint_material_activities", [
      "material_id",
      "activity_id",
    ])
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_material_activities")
    .dropConstraint("unique_constraint_material_activities")
    .execute()
}
