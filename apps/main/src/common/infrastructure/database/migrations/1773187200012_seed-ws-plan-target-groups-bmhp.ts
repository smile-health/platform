import type { Kysely } from "kysely"

/**
 * Seed ws_plan_target_group untuk semua program_plan BMHP (year >= 2026).
 *
 * Source: Master_Data_Sasaran.xlsx — 44 kelompok sasaran yang sudah di-seed
 * ke tabel `target_groups` oleh migration 1773187200000.
 *
 * Flow:
 *   1. Cari semua BMHP program_plan (year >= 2026)
 *   2. Cari target_group_id dari `target_groups` berdasarkan title
 *   3. Insert ws_plan_target_group (program_plan_id, target_group_id)
 *      — idempotent: skip jika sudah ada (deleted_at IS NULL)
 *
 * Catatan: `target_group_id` mengacu ke `target_groups.id` (bukan bmhp_target_groups.id)
 */

const TITLES = [
  "Balita Usia 2 Tahun dengan Anemia",
  "Balita Usia 3-6 Tahun dengan Risiko Talasemia",
  "Dewasa Usia 40 - 59 Tahun dengan HT & DM",
  "Estimasi Kasus TB (Semua Usia)",
  "Anak Usia Sekolah Kelas 1-6 (7-12 thn)",
  "Sasaran Skrining Anemia & Talasemia (Sekolah)",
  "Lansia ≥ 60 thn dengan HT & DM",
  "Usia > 18 Tahun",
  "Seluruh Usia",
  "Perempuan 30-69 thn (Skrining Kanker)",
  "Anak Usia Sekolah (7-12 thn) dengan Faktor Risiko",
  "Balita (Umum)",
  "Balita Usia 3-6 Tahun dengan Risiko",
  "Balita Usia 2 Tahun",
  "Bayi Baru Lahir (SHK)",
  "Dewasa Usia 18 - 59 Tahun",
  "Estimasi Kasus TB Anak (0-14 thn)",
  "Ibu Hamil",
  "Siswa Kelas 1-12 dengan Risiko Hepatitis B",
  "Siswa Kelas 10-12 (16-17 thn)",
  "Remaja Putri Kelas 10 (16 thn)",
  "Siswa Kelas 7-12 dengan Risiko Hepatitis C",
  "Siswa Kelas 7 (13 thn)",
  "Siswa Kelas 8-9 dengan Faktor Risiko",
  "Catin Laki-laki & Perempuan (18-49 thn)",
  "Lansia (Umum)",
  "Catin Perempuan (18-49 thn)",
  "Sasaran Skrining Fungsi Ginjal",
  "Seluruh Usia (Wilayah Endemis Tinggi)",
  "Usia > 40 tahun",
  "Sasaran Skrining GDS",
  "Kelas 8-12 (13-17 tahun) dengan faktor risiko Talasemia",
  "Suspek Malaria (Wilayah Endemis)",
  "Lansia ≥ 60 thn dengan Risiko Hepatitis C",
  "Lansia ≥ 60 thn dengan Risiko Hepatitis B",
  "Dewasa 18-59 thn dengan Risiko Hepatitis C",
  "Dewasa 18-59 thn dengan Risiko Hepatitis B",
  "Kelas 7 dengan Anemia",
  "Laki-laki dan Perempuan usia ≥ 45 tahun",
  "Prevalensi Hepatitis B (2,4%)",
  "Prevalensi Hepatitis C (0,5%)",
  "Prevalensi Obesitas sentral (36,8%)",
  "Prevalensi Dislipidemia (8,8%)",
  "Prevalensi Diabetes Melitus (11,7%)",
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

  // Fetch target_group IDs berdasarkan titles dari Excel
  const tgRows: any[] = await db
    .selectFrom("target_groups")
    .select(["id", "title"])
    .where("title", "in", TITLES)
    .where("deleted_at", "is", null)
    .execute()

  if (tgRows.length === 0) return

  const tgIds = tgRows.map((r: any) => Number(r.id))

  // Fetch existing ws_plan_target_group untuk idempotency
  const existing: any[] = await db
    .selectFrom("ws_plan_target_group")
    .select(["program_plan_id", "target_group_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("target_group_id", "in", tgIds)
    .where("deleted_at", "is", null)
    .execute()

  const existingSet = new Set(
    existing.map((r: any) => `${r.program_plan_id}|${r.target_group_id}`)
  )

  const toInsert: Array<{ program_plan_id: number; target_group_id: number }> = []
  for (const planId of programPlanIds) {
    for (const tgId of tgIds) {
      const key = `${planId}|${tgId}`
      if (!existingSet.has(key)) {
        toInsert.push({ program_plan_id: planId, target_group_id: tgId })
      }
    }
  }

  if (toInsert.length === 0) return

  const BATCH = 100
  for (let i = 0; i < toInsert.length; i += BATCH) {
    await db
      .insertInto("ws_plan_target_group")
      .values(toInsert.slice(i, i + BATCH))
      .execute()
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

  // Fetch target_group IDs dari titles yang di-seed migration ini
  const tgRows: any[] = await db
    .selectFrom("target_groups")
    .select("id")
    .where("title", "in", TITLES)
    .where("deleted_at", "is", null)
    .execute()

  if (tgRows.length === 0) return

  const tgIds = tgRows.map((r: any) => Number(r.id))

  const BATCH = 100
  for (let i = 0; i < programPlanIds.length; i += BATCH) {
    await db
      .deleteFrom("ws_plan_target_group")
      .where("program_plan_id", "in", programPlanIds.slice(i, i + BATCH))
      .where("target_group_id", "in", tgIds)
      .execute()
  }
}
