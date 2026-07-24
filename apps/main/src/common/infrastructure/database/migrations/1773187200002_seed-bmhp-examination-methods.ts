import type { Kysely } from "kysely"

/**
 * Seed bmhp_examination_methods dari Master_Data_Metode.xlsx
 * Cek existing by (name, program_plan_id) sebelum insert agar idempotent.
 * Insert per program_plan BMHP dengan year >= 2026.
 * "Enzimatik" sudah ada sebelum migration ini
 */
export async function up(db: Kysely<any>): Promise<void> {
  const rows = [
    { name: "Flow Cytometry", description: null },
    { name: "Enzimatik", description: null },
    { name: "Molekuler", description: null },
    { name: "Mikroskopis", description: null },
    { name: "Lateral Flow", description: null },
    { name: "Reflactance photometri", description: null },
    { name: "Konvensional (kimia)", description: null },
    { name: "Tidak ada metode", description: "Not Available" },
  ]

  // Lookup approach_id BMHP dari plan_approaches
  const bmhpApproach = await db
    .selectFrom("plan_approaches")
    .select("id")
    .where("name", "=", "BMHP")
    .where("deleted_at", "is", null)
    .executeTakeFirst()
  if (!bmhpApproach) return

  // Fetch semua program_plan BMHP year >= 2026
  const programPlans: any[] = await db
    .selectFrom("ws_program_plans")
    .select("id")
    .where("approach_id", "=", bmhpApproach.id)
    .where("year", ">=", 2026)
    .where("deleted_at", "is", null)
    .execute()
  if (programPlans.length === 0) return

  const programPlanIds = programPlans.map((pp) => Number(pp.id))

  // Cek existing by (name, program_plan_id)
  const existing: any[] = await db
    .selectFrom("bmhp_examination_methods")
    .select(["name", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const existingSet = new Set(existing.map((r) => `${r.name}__${r.program_plan_id}`))

  const toInsert: Array<{ name: string; description: string | null; program_plan_id: number }> = []
  for (const planId of programPlanIds) {
    for (const row of rows) {
      if (!existingSet.has(`${row.name}__${planId}`)) {
        toInsert.push({ ...row, program_plan_id: planId })
      }
    }
  }

  if (toInsert.length > 0) {
    const BATCH = 50
    for (let i = 0; i < toInsert.length; i += BATCH) {
      await db.insertInto("bmhp_examination_methods").values(toInsert.slice(i, i + BATCH)).execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Hanya hapus yang di-insert migration ini.
  // "Enzimatik" dikecualikan - sudah ada sebelum migration ini
  const names = [
    "Flow Cytometry",
    "Molekuler",
    "Mikroskopis",
    "Lateral Flow",
    "Reflactance photometri",
    "Konvensional (kimia)",
    "Tidak ada metode",
  ]

  const bmhpApproach = await db
    .selectFrom("plan_approaches")
    .select("id")
    .where("name", "=", "BMHP")
    .where("deleted_at", "is", null)
    .executeTakeFirst()
  if (!bmhpApproach) return

  const programPlans: any[] = await db
    .selectFrom("ws_program_plans")
    .select("id")
    .where("approach_id", "=", bmhpApproach.id)
    .where("year", ">=", 2026)
    .where("deleted_at", "is", null)
    .execute()
  if (programPlans.length === 0) return

  const programPlanIds = programPlans.map((pp) => Number(pp.id))

  await db
    .deleteFrom("bmhp_examination_methods")
    .where("name", "in", names)
    .where("program_plan_id", "in", programPlanIds)
    .execute()
}
