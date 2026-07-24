import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_map_service_points")
    .addUniqueConstraint("unique_microplanning_entity", [
      "microplanning_id",
      "entity_id",
    ])
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema
    .alterTable("ws_map_service_points")
    .dropConstraint("unique_microplanning_entity")
    .execute()
}
