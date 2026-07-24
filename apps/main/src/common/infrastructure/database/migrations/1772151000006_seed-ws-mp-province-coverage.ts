/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from "kysely"

const CATEGORY_MAP: Array<{ category: "non_bias" | "bias"; tgIds: number[] }> = [
  { category: "non_bias", tgIds: [1, 2, 3, 9] },
  { category: "bias", tgIds: [4, 5, 7, 10] },
]

export async function up(db: Kysely<any>): Promise<void> {
  for (const { category, tgIds } of CATEGORY_MAP) {
    // Satu JOIN query menggantikan nested loop:
    // ws_coverage + ws_plan_tasks → ws_mp_program_config → ws_mp_material_target_config
    const rows = await db
      .selectFrom("ws_coverage as c")
      .innerJoin("ws_plan_tasks as pt", "pt.id", "c.plan_task_id")
      .innerJoin("ws_mp_program_config as pc", (join) =>
        join
          .onRef("pc.seeded_from_plan_id", "=", "pt.program_plan_id")
          .on("pc.category", "=", category)
          .on("pc.deleted_at", "is", null)
      )
      .innerJoin("ws_mp_material_target_config as mc", (join) =>
        join
          .onRef("mc.mp_program_config_id", "=", "pc.id")
          .onRef("mc.material_id", "=", "pt.material_id")
          .onRef("mc.target_group_id", "=", "pt.target_group_id")
          .on("mc.deleted_at", "is", null)
      )
      .select([
        "mc.id as mc_id",
        "c.province_id",
        "c.coverage_number",
      ])
      .where("c.deleted_at", "is", null)
      .where("pt.deleted_at", "is", null)
      .where("pt.target_group_id", "in", tgIds)
      .execute()

    for (const row of rows) {
      await db
        .insertInto("ws_mp_province_coverage")
        .values({
          mp_material_target_config_id: row.mc_id,
          province_id: row.province_id,
          coverage_number: row.coverage_number,
        })
        .ignore()
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("ws_mp_province_coverage").execute()
}
