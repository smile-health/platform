import type { Kysely } from "kysely"

/**
 * Seed ws_mp_program_config berdasarkan data CSV Result_8_updated.csv
 * year=2027, program_id=1, category: non_bias & bias
 */
export async function up(db: Kysely<any>): Promise<void> {
  const rows = [
    {
      year: 2027,
      program_id: 1,
      category: "non_bias" as const,
      status: 1,
      seeded_from_plan_id: 3,
      seeded_at: new Date("2026-02-28T12:58:25Z"),
    },
    {
      year: 2027,
      program_id: 1,
      category: "bias" as const,
      status: 1,
      seeded_from_plan_id: 3,
      seeded_at: new Date("2026-02-28T12:58:25Z"),
    },
  ]

  for (const row of rows) {
    await db.insertInto("ws_mp_program_config").values(row).ignore().execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom("ws_mp_program_config")
    .where("year", "=", 2027)
    .where("program_id", "=", 1)
    .execute()
}
