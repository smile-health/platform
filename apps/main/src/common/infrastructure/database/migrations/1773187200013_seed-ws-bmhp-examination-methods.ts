import type { Kysely } from "kysely"

/**
 * Seed ws_bmhp_examination_methods — relasi examination → method per program_plan.
 *
 * Source: Master_Data_Pemeriksaan.xlsx (kolom Nama, Metode)
 * Dependency:
 *   - migration 002: bmhp_examination_methods sudah ter-seed (8 methods per plan)
 *   - migration 011: bmhp_examinations sudah ter-seed (19 examinations per plan)
 *
 * Unique constraint: (examination_id, method_id) di ws_bmhp_examination_methods
 */

// Map: nama examination → nama method (dari Master_Data_Pemeriksaan.xlsx)
const EXAM_METHOD_MAP: Record<string, string> = {
  "Talasemia Lanjutan (pemeriksaan darah lengkap)": "Flow Cytometry",
  "Profil Lipid": "Enzimatik",
  "Fungsi Ginjal": "Enzimatik",
  "Tuberkulosis": "Molekuler",
  "Gigi": "Tidak ada metode",
  "Fibrosis/Sirosis": "Enzimatik",
  "Malaria": "Mikroskopis",
  "Risiko Jantung": "Tidak ada metode",
  "Kanker Payudara": "Tidak ada metode",
  "Gula Darah": "Lateral Flow",
  "Anemia": "Lateral Flow",
  "SHK, G6PD, SHAK": "Tidak ada metode",
  "Kehamilan": "Tidak ada metode",
  "Hepatitis B": "Lateral Flow",
  "HIV dan Sifilis": "Lateral Flow",
  "Proteinuria": "Reflactance photometri",
  "Hepatitis C": "Lateral Flow",
  "Kanker Usus": "Konvensional (kimia)",
  "Kanker Leher Rahim": "Tidak ada metode",
}

export async function up(db: Kysely<any>): Promise<void> {
  // Lookup approach_id BMHP
  const bmhpApproach = await db
    .selectFrom("plan_approaches")
    .select("id")
    .where("name", "=", "BMHP")
    .where("deleted_at", "is", null)
    .executeTakeFirst()
  if (!bmhpApproach) return

  // Fetch semua BMHP program_plan year >= 2026
  const programPlans: any[] = await db
    .selectFrom("ws_program_plans")
    .select("id")
    .where("approach_id", "=", bmhpApproach.id)
    .where("year", ">=", 2026)
    .where("deleted_at", "is", null)
    .execute()
  if (programPlans.length === 0) return

  const programPlanIds = programPlans.map((pp) => Number(pp.id))

  for (const planId of programPlanIds) {
    // Fetch examinations for this plan (name lower → id)
    const examRows: any[] = await db
      .selectFrom("bmhp_examinations")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const examIdByName = new Map<string, number>(
      examRows.map((r: any) => [r.name.toLowerCase().trim(), Number(r.id)])
    )

    // Fetch methods for this plan (name lower → id)
    const methodRows: any[] = await db
      .selectFrom("bmhp_examination_methods")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const methodIdByName = new Map<string, number>(
      methodRows.map((r: any) => [r.name.toLowerCase().trim(), Number(r.id)])
    )

    // Fetch existing ws_bmhp_examination_methods for idempotency
    const examIds = [...examIdByName.values()]
    const existingSet = new Set<string>()
    if (examIds.length > 0) {
      const existing: any[] = await db
        .selectFrom("ws_bmhp_examination_methods")
        .select(["examination_id", "method_id"])
        .where("examination_id", "in", examIds)
        .execute()
      for (const r of existing) {
        existingSet.add(`${r.examination_id}|${r.method_id}`)
      }
    }

    const toInsert: Array<{ examination_id: number; method_id: number }> = []

    for (const [examName, methodName] of Object.entries(EXAM_METHOD_MAP)) {
      const examId = examIdByName.get(examName.toLowerCase().trim())
      const methodId = methodIdByName.get(methodName.toLowerCase().trim())
      if (!examId || !methodId) continue

      const key = `${examId}|${methodId}`
      if (!existingSet.has(key)) {
        toInsert.push({ examination_id: examId, method_id: methodId })
        existingSet.add(key)
      }
    }

    if (toInsert.length > 0) {
      await db.insertInto("ws_bmhp_examination_methods").values(toInsert).execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
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

  const examNames = Object.keys(EXAM_METHOD_MAP)

  // Fetch examination IDs yang di-seed migration ini
  const examRows: any[] = await db
    .selectFrom("bmhp_examinations")
    .select("id")
    .where("name", "in", examNames)
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  if (examRows.length === 0) return

  const examIds = examRows.map((r: any) => Number(r.id))

  const BATCH = 50
  for (let i = 0; i < examIds.length; i += BATCH) {
    await db
      .deleteFrom("ws_bmhp_examination_methods")
      .where("examination_id", "in", examIds.slice(i, i + BATCH))
      .execute()
  }
}
