import type { Kysely } from "kysely"

/**
 * Seed bmhp_examination_types dari Master_Data_Jenis_Pemeriksaan.xlsx
 * Cek existing by (name, program_plan_id) sebelum insert agar idempotent.
 * Insert per program_plan BMHP dengan year >= 2026.
 * "Hematologi" dan "Kimia Klinik" sudah ada sebelum migration ini
 */
export async function up(db: Kysely<any>): Promise<void> {
  const rows = [
    { name: "Hematologi", description: "Pemeriksaan darah lengkap dan komponen darah" },
    { name: "Kimia Klinik", description: "Pemeriksaan kimia darah" },
    { name: "Mikrobiologi Klinik, Parasitologi dan Imunologi", description: "Pemeriksaan mikroorganisme dan sistem imun" },
    { name: "Urinalisis", description: "Pemeriksaan urin" },
    { name: "Feses (Tinja)", description: "Pemeriksaan feses" },
    { name: "-", description: "Kategori lain-lain" },
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
    .selectFrom("bmhp_examination_types")
    .select(["name", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const existingSet = new Set(existing.map((r) => `${r.name}__${r.program_plan_id}`))

  const toInsert: Array<{ name: string; description: string; program_plan_id: number }> = []
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
      await db.insertInto("bmhp_examination_types").values(toInsert.slice(i, i + BATCH)).execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Hanya hapus yang di-insert migration ini.
  // "Hematologi" dan "Kimia Klinik" dikecualikan - sudah ada sebelum migration ini
  const names = [
    "Mikrobiologi Klinik, Parasitologi dan Imunologi",
    "Urinalisis",
    "Feses (Tinja)",
    "-",
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
    .deleteFrom("bmhp_examination_types")
    .where("name", "in", names)
    .where("program_plan_id", "in", programPlanIds)
    .execute()
}
