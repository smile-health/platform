/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  const finalPlans = await db
    .selectFrom("ws_program_plans")
    .select(["id", "year", "program_id"])
    .where("is_active", "=", 1)
    .where("deleted_at", "is", null)
    .execute()

  for (const plan of finalPlans) {
    for (const category of ["non_bias", "bias"] as const) {
      await db
        .insertInto("ws_mp_program_config")
        .values({
          year: plan.year,
          program_id: plan.program_id,
          category,
          status: 1,
          seeded_from_plan_id: plan.id,
          seeded_at: new Date(),
        })
        .ignore()
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("ws_mp_program_config").execute()
}
