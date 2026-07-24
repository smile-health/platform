import type { Kysely } from "kysely"

/**
 * Update examination_type_id di bmhp_examinations berdasarkan data
 * Master_Data_Pemeriksaan.xlsx (kolom Nama → Jenis).
 *
 * Migration 011 meng-insert examination dengan typeName dari hardcode EXAMS[],
 * namun beberapa examination menggunakan typeName "-" yang bisa saja null atau
 * belum ter-assign dengan benar. Migration ini memastikan semua 19 examination
 * yang di-seed migration 011 memiliki examination_type_id yang tepat.
 *
 * Dependency:
 *   - migration 001: bmhp_examination_types sudah ter-seed (6 types per plan)
 *   - migration 011: bmhp_examinations sudah ter-seed (19 examinations per plan)
 */

// Map: nama examination → nama jenis (dari Master_Data_Pemeriksaan.xlsx kolom Jenis)
const EXAM_TYPE_MAP: Record<string, string> = {
  "Talasemia Lanjutan (pemeriksaan darah lengkap)": "Hematologi",
  "Profil Lipid": "Kimia Klinik",
  "Fungsi Ginjal": "Kimia Klinik",
  "Tuberkulosis": "Mikrobiologi Klinik, Parasitologi dan Imunologi",
  "Gigi": "-",
  "Fibrosis/Sirosis": "Kimia Klinik",
  "Malaria": "Mikrobiologi Klinik, Parasitologi dan Imunologi",
  "Risiko Jantung": "-",
  "Kanker Payudara": "-",
  "Gula Darah": "Kimia Klinik",
  "Anemia": "Hematologi",
  "SHK, G6PD, SHAK": "-",
  "Kehamilan": "Mikrobiologi Klinik, Parasitologi dan Imunologi",
  "Hepatitis B": "Mikrobiologi Klinik, Parasitologi dan Imunologi",
  "HIV dan Sifilis": "Mikrobiologi Klinik, Parasitologi dan Imunologi",
  "Proteinuria": "Urinalisis",
  "Hepatitis C": "Mikrobiologi Klinik, Parasitologi dan Imunologi",
  "Kanker Usus": "Feses (Tinja)",
  "Kanker Leher Rahim": "-",
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
  const examNames = Object.keys(EXAM_TYPE_MAP)

  for (const planId of programPlanIds) {
    // Fetch examination types untuk plan ini (name lower → id)
    const typeRows: any[] = await db
      .selectFrom("bmhp_examination_types")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const typeIdByName = new Map<string, number>(
      typeRows.map((r: any) => [r.name.toLowerCase().trim(), Number(r.id)])
    )

    // Fetch examinations yang perlu di-update untuk plan ini
    const examRows: any[] = await db
      .selectFrom("bmhp_examinations")
      .select(["id", "name", "examination_type_id"])
      .where("program_plan_id", "=", planId)
      .where("name", "in", examNames)
      .where("deleted_at", "is", null)
      .execute()

    for (const exam of examRows) {
      const typeName = EXAM_TYPE_MAP[exam.name]
      if (typeName === undefined) continue

      const typeId = typeIdByName.get(typeName.toLowerCase().trim())
      if (typeId === undefined) continue

      // Hanya update jika examination_type_id belum sesuai
      if (Number(exam.examination_type_id) === typeId) continue

      await db
        .updateTable("bmhp_examinations")
        .set({ examination_type_id: typeId })
        .where("id", "=", Number(exam.id))
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // down() tidak bisa restore nilai lama (tidak di-track).
  // Jika perlu rollback, jalankan ulang migration 011 down() lalu up().
  // Tidak ada aksi yang diperlukan di sini.
}
