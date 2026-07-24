import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createView("ws_microplanning_villages")
    .orReplace()
    .as(
      db
        .selectFrom("ws_microplanning as m")
        .innerJoin("ws_entities as e", "e.id", "m.entity_id")
        .innerJoin("locations as l", "l.parent_id", "e.sub_district_id")
        .leftJoin("ws_microplanning_patient_targets as mpt", (join) =>
          join
            .onRef("mpt.microplanning_id", "=", "m.id")
            .onRef("mpt.reff_id", "=", "l.id")
            .on("mpt.reff_type", "=", "village")
            .on("mpt.deleted_at", "is", null)
        )
        .leftJoin("ws_microplan_absolute_target as mat", (join) =>
          join
            .onRef("mat.microplan_id", "=", "m.id")
            .onRef("mat.reff_id", "=", "l.id")
            .on("mat.reff_type", "=", "village")
            .on("mat.deleted_at", "is", null)
            .on("mat.qty", ">", 0)
        )
        .select([
          "m.id as microplanning_id",
          "l.id as village_id",
          "m.year",
          "e.name as entity_name",
          sql<number>`CASE WHEN mpt.id IS NOT NULL OR mat.id IS NOT NULL THEN 1 ELSE 0 END`.as(
            "is_assigned"
          ),
        ])
        .where("l.level", "=", 3)
        .distinct()
    )
    .execute()
}
