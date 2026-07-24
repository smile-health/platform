import type { Kysely } from "kysely"

/**
 * Seed bmhp_parameters dari Master_Data_Relasi_Pemeriksaan.xlsx
 * 29 unique parameter names (excludes "Not Available")
 * Insert per program_plan BMHP year >= 2026, idempotent by (name, program_plan_id)
 */

const PARAMETERS = [
  { name: "Anti HCV, kualitatif", unit: null, description: null },
  { name: "Anti HIV, kualitatif", unit: null, description: null },
  { name: "BTA Mycobacterium Tuberculosis (semi kuantitatif)", unit: null, description: null },
  { name: "Berat Jenis, kuantitatif", unit: null, description: null },
  { name: "Bilirubin, semi kuantitatif", unit: null, description: null },
  { name: "Darah samar", unit: null, description: null },
  { name: "Darah samar, semi kuantitatif", unit: null, description: null },
  { name: "Eritrosit, hitung jumlah", unit: null, description: null },
  { name: "Glukosa, penetapan kadar", unit: null, description: null },
  { name: "Glukosa, semi kuantitatif", unit: null, description: null },
  { name: "HBsAg, kualitatif", unit: null, description: null },
  { name: "Hematokrit, penetapan nilai", unit: null, description: null },
  { name: "Hemoglobin, penetapan kadar", unit: null, description: null },
  { name: "Indeks Eritrosit (MCV, MCH, CHC), penetapan nilai", unit: null, description: null },
  { name: "Keton, semi kuantitatif", unit: null, description: null },
  { name: "Kolesterol HDL, penetapan kadar", unit: null, description: null },
  { name: "Kolesterol LDL", unit: null, description: null },
  { name: "Kolesterol total, penetapan kadar", unit: null, description: null },
  { name: "Kreatinin, penetapan kadar", unit: null, description: null },
  { name: "Leukosit, hitung jumlah", unit: null, description: null },
  { name: "Malaria, kuantitatif", unit: null, description: null },
  { name: "Nitrit, semi kuantitatif", unit: null, description: null },
  { name: "Protein, semi kuantitatif", unit: null, description: null },
  { name: "SGOT, penetapan kadar", unit: null, description: null },
  { name: "Tes Kehamilan, kualitatif", unit: null, description: null },
  { name: "Trigliserida, penetapan kadar", unit: null, description: null },
  { name: "Trombosit, hitung jumlah", unit: null, description: null },
  { name: "Urobilinogen, kuantitatif", unit: null, description: null },
  { name: "pH, kuantitatif", unit: null, description: null },
]

export async function up(db: Kysely<any>): Promise<void> {
  // Lookup approach_id BMHP
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
    .selectFrom("bmhp_parameters")
    .select(["name", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const existingSet = new Set(existing.map((r: any) => `${r.name}__${r.program_plan_id}`))

  const toInsert: Array<{ name: string; unit: null; description: null; program_plan_id: number }> = []
  for (const planId of programPlanIds) {
    for (const p of PARAMETERS) {
      if (!existingSet.has(`${p.name}__${planId}`)) {
        toInsert.push({ ...p, program_plan_id: planId })
      }
    }
  }

  if (toInsert.length > 0) {
    const BATCH = 50
    for (let i = 0; i < toInsert.length; i += BATCH) {
      await db.insertInto("bmhp_parameters").values(toInsert.slice(i, i + BATCH)).execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const names = PARAMETERS.map((p) => p.name)

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

  // Ambil IDs dulu sebelum delete
  const rows: any[] = await db
    .selectFrom("bmhp_parameters")
    .select("id")
    .where("name", "in", names)
    .where("program_plan_id", "in", programPlanIds)
    .execute()
  const ids = rows.map((r: any) => Number(r.id))
  if (ids.length === 0) return

  // Hapus child di ws_bmhp_examination_parameters terlebih dahulu
  const BATCH = 50
  for (let i = 0; i < ids.length; i += BATCH) {
    await db
      .deleteFrom("ws_bmhp_examination_parameters")
      .where("parameter_id", "in", ids.slice(i, i + BATCH))
      .execute()
  }

  // Baru hapus parent bmhp_parameters
  for (let i = 0; i < ids.length; i += BATCH) {
    await db
      .deleteFrom("bmhp_parameters")
      .where("id", "in", ids.slice(i, i + BATCH))
      .execute()
  }
}
