import type { Kysely } from "kysely"
import { sql } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createView("ws_microplanning_schools")
    .orReplace()
    .as(
      db
        .selectFrom("ws_microplanning as m")
        .innerJoin("ws_entities as me", "me.id", "m.entity_id")
        .innerJoin("ws_entities as e", (join) =>
          join
            .onRef("e.sub_district_id", "=", "me.sub_district_id")
            .onRef("e.program_id", "=", "me.program_id")
        )
        .leftJoin("ws_microplanning_patient_targets as mpt", (join) =>
          join
            .onRef("mpt.reff_id", "=", "e.id")
            .onRef("mpt.microplanning_id", "=", "m.id")
            .on("mpt.reff_type", "=", "school")
            .on("mpt.deleted_at", "is", null)
        )
        .leftJoin("ws_microplan_absolute_target as mat", (join) =>
          join
            .onRef("mat.reff_id", "=", "e.id")
            .onRef("mat.microplan_id", "=", "m.id")
            .on("mat.reff_type", "=", "school")
            .on("mat.deleted_at", "is", null)
            .on("mat.qty", ">", 0)
        )
        .select([
          "m.id as microplanning_id",
          "e.id as school_id",
          "me.name as entity_name",
          "m.year",
          "e.name",
          "e.lat",
          "e.lng",
          "e.sub_district_id",
          sql<number>`CASE WHEN mpt.id IS NOT NULL OR mat.id IS NOT NULL THEN 1 ELSE 0 END`.as(
            "is_assigned"
          ),
        ])
        .where("e.entity_tag_id", "=", 14)
        .where((eb) =>
          eb.or([eb("e.name", "like", "MI%"), eb("e.name", "like", "SD%")])
        )
        .distinct()
    )
    .execute()
}
