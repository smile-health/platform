import type { Kysely } from "kysely"

const THALASSEMIA_BMHPS = [
  "Reagen diluent",
  "Reagen cleanser",
  "Reagen lyse",
  "Wing needle",
  "Alcohol Swab",
  "Handscoon",
  "Plester bulat bening",
  "Tabung vacutainer tutup ungu (EDTA)",
  "Reagen control",
]

const LIPID_BMHPS = [
  "Reagen control",
  "Reagensia Cholesterol Total",
  "Reagensia HDL Direct",
  "Reagensia LDL Direct",
  "Reagensia Trigliserida",
  "Alcohol Swab",
  "Plester bulat bening",
  "Tabung vacutainer tutup kuning",
  "Tip Kuning",
  "Vacutainer Needle",
]

const FIBROSIS_BMHPS = [
  "Reagen SGOT",
  "Reagen diluent",
  "Reagen cleanser",
  "Reagen lyse",
  "Alcohol Swab",
  "Handscoon",
  "Plester bulat bening",
  "Tabung vacutainer tutup ungu",
  "Vacutainer Needle",
  "Vacutainer tutup merah",
  "Tabung vacutainer tutup ungu (EDTA)",
  "Reagen control",
]

const EXAM_TARGET_MATERIALS: Array<{ examName: string; sasaranName: string; bmhps: string[] }> = [
  { examName: "Anemia", sasaranName: "Balita Usia 2 Tahun", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Anemia", sasaranName: "Ibu Hamil", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Anemia", sasaranName: "Remaja Putri Kelas 10 (16 thn)", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Anemia", sasaranName: "Siswa Kelas 7 (13 thn)", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Anemia", sasaranName: "Catin Perempuan (18-49 thn)", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Fibrosis/Sirosis", sasaranName: "Usia > 18 Tahun", bmhps: FIBROSIS_BMHPS },
  { examName: "Fibrosis/Sirosis", sasaranName: "Usia > 40 tahun", bmhps: FIBROSIS_BMHPS },
  { examName: "Fibrosis/Sirosis", sasaranName: "Prevalensi Hepatitis B (2,4%)", bmhps: FIBROSIS_BMHPS },
  { examName: "Fibrosis/Sirosis", sasaranName: "Prevalensi Obesitas sentral (36,8%)", bmhps: FIBROSIS_BMHPS },
  { examName: "Fibrosis/Sirosis", sasaranName: "Prevalensi Dislipidemia (8,8%)", bmhps: FIBROSIS_BMHPS },
  { examName: "Fibrosis/Sirosis", sasaranName: "Prevalensi Diabetes Melitus (11,7%)", bmhps: FIBROSIS_BMHPS },
  { examName: "Fibrosis/Sirosis", sasaranName: "Prevalensi Hepatitis C (0,5%)", bmhps: FIBROSIS_BMHPS },
  { examName: "Fungsi Ginjal", sasaranName: "Dewasa Usia 40 - 59 Tahun dengan HT & DM", bmhps: ["Reagen kreatinin", "Reagen Ureum", "Handscoon", "Tabung vacutainer tutup kuning", "Tip Kuning", "Vacutainer Needle"] },
  { examName: "Fungsi Ginjal", sasaranName: "Lansia ≥ 60 thn dengan HT & DM", bmhps: ["Reagen kreatinin", "Reagen Ureum", "Handscoon", "Tabung vacutainer tutup kuning", "Tip Kuning", "Vacutainer Needle"] },
  { examName: "Gigi", sasaranName: "Anak Usia Sekolah Kelas 1-6 (7-12 thn)", bmhps: ["Dental plaque disclosing", "Kapas", "Dental Kit", "Fluorida Varnish", "Microbrush", "Cawan", "Celemek Dental"] },
  { examName: "Gula Darah", sasaranName: "Anak Usia Sekolah (7-12 thn) dengan Faktor Risiko", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Balita Usia 3-6 Tahun dengan Risiko", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Balita Usia 2 Tahun", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Dewasa Usia 18 - 59 Tahun", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Ibu Hamil", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Siswa Kelas 10-12 (16-17 thn)", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Siswa Kelas 8-9 dengan Faktor Risiko", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Lansia (Umum)", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "Gula Darah", sasaranName: "Siswa Kelas 7 (13 thn)", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
  { examName: "HIV dan Sifilis", sasaranName: "Ibu Hamil", bmhps: ["Rapid Test HIV", "Rapid Test HIV dan Sifilis combo/dual", "Rapid Test Sifilis"] },
  { examName: "HIV dan Sifilis", sasaranName: "Catin Laki-laki & Perempuan (18-49 thn)", bmhps: ["Rapid Test HIV", "Rapid Test HIV dan Sifilis combo/dual", "Rapid Test Sifilis"] },
  { examName: "Hepatitis B", sasaranName: "Ibu Hamil", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
  { examName: "Hepatitis B", sasaranName: "Siswa Kelas 1-12 dengan Risiko Hepatitis B", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
  { examName: "Hepatitis B", sasaranName: "Lansia ≥ 60 thn dengan Risiko Hepatitis B", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
  { examName: "Hepatitis B", sasaranName: "Dewasa 18-59 thn dengan Risiko Hepatitis B", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
  { examName: "Hepatitis C", sasaranName: "Siswa Kelas 7-12 dengan Risiko Hepatitis C", bmhps: ["Rapid test Hepatitis C (anti HCV)"] },
  { examName: "Hepatitis C", sasaranName: "Lansia ≥ 60 thn dengan Risiko Hepatitis C", bmhps: ["Rapid test Hepatitis C (anti HCV)"] },
  { examName: "Hepatitis C", sasaranName: "Dewasa 18-59 thn dengan Risiko Hepatitis C", bmhps: ["Rapid test Hepatitis C (anti HCV)"] },
  { examName: "Kanker Leher Rahim", sasaranName: "Perempuan 30-69 thn (Skrining Kanker)", bmhps: ["Collecting Kit (cytobrush + VTM)"] },
  { examName: "Kanker Payudara", sasaranName: "Perempuan 30-69 thn (Skrining Kanker)", bmhps: ["Gel USG"] },
  { examName: "Kanker Usus", sasaranName: "Laki-laki dan Perempuan usia ≥ 45 tahun", bmhps: ["Fecal OBT", "Handscoon", "Pot Sample Feses"] },
  { examName: "Kehamilan", sasaranName: "Ibu Hamil", bmhps: ["Gel USG"] },
  { examName: "Malaria", sasaranName: "Seluruh Usia", bmhps: ["Reagensia Malaria (metanol, immertion oil dan giemsa)"] },
  { examName: "Malaria", sasaranName: "Seluruh Usia (Wilayah Endemis Tinggi)", bmhps: ["Rapid Test Malaria"] },
  { examName: "Malaria", sasaranName: "Suspek Malaria (Wilayah Endemis)", bmhps: ["Rapid Test Malaria"] },
  { examName: "Profil Lipid", sasaranName: "Dewasa Usia 40-59 Tahun dengan HT & DM", bmhps: LIPID_BMHPS },
  { examName: "Profil Lipid", sasaranName: "Lansia ≥ 60 thn dengan HT & DM", bmhps: LIPID_BMHPS },
  { examName: "Proteinuria", sasaranName: "Ibu Hamil", bmhps: ["Glukuproteinuria", "Pot urine"] },
  { examName: "Risiko Jantung", sasaranName: "Lansia ≥ 60 thn dengan HT & DM", bmhps: ["Gel EKG", "Thermal paper EKG"] },
  { examName: "Risiko Jantung", sasaranName: "Dewasa Usia 40-59 Tahun dengan HT & DM", bmhps: ["Gel EKG", "Thermal paper EKG"] },
  { examName: "SHK, G6PD, SHAK", sasaranName: "Bayi Baru Lahir (SHK)", bmhps: ["Alcohol Swab", "Handscoon", "Lancet Pediatric", "Plester", "Kertas Saring", "Plastik klip"] },
  { examName: "Talasemia Lanjutan (pemeriksaan darah lengkap)", sasaranName: "Balita Usia 2 Tahun dengan Anemia", bmhps: THALASSEMIA_BMHPS },
  { examName: "Talasemia Lanjutan (pemeriksaan darah lengkap)", sasaranName: "Balita Usia 3-6 Tahun dengan Risiko Talasemia", bmhps: THALASSEMIA_BMHPS },
  { examName: "Talasemia Lanjutan (pemeriksaan darah lengkap)", sasaranName: "Kelas 7 dengan Anemia", bmhps: THALASSEMIA_BMHPS },
  { examName: "Talasemia Lanjutan (pemeriksaan darah lengkap)", sasaranName: "Kelas 8-12 (13-17 tahun) dengan faktor risiko Talasemia", bmhps: THALASSEMIA_BMHPS },
  { examName: "Tuberkulosis", sasaranName: "Estimasi Kasus TB (Semua Usia)", bmhps: ["Cartridge TCM", "Reagensia BTA", "Pot Sputum"] },
  { examName: "Tuberkulosis", sasaranName: "Estimasi Kasus TB Anak (0-14 thn)", bmhps: ["Tuberkulin Vial"] },
]

const BATCH = 50

async function fetchBMHPPlanIds(db: Kysely<any>): Promise<number[]> {
  const bmhpApproach = await db
    .selectFrom("plan_approaches")
    .select("id")
    .where("name", "=", "BMHP")
    .where("deleted_at", "is", null)
    .executeTakeFirst()
  if (!bmhpApproach) return []

  const programPlans: any[] = await db
    .selectFrom("ws_program_plans")
    .select("id")
    .where("approach_id", "=", bmhpApproach.id)
    .where("year", ">=", 2026)
    .where("deleted_at", "is", null)
    .execute()

  return programPlans.map((pp) => Number(pp.id))
}

export async function up(db: Kysely<any>): Promise<void> {
  const programPlanIds = await fetchBMHPPlanIds(db)
  if (programPlanIds.length === 0) return

  for (const planId of programPlanIds) {
    // Lookup new bmhp_materials (name → id) for this plan
    const bmhpMatRows: any[] = await db
      .selectFrom("bmhp_materials")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const bmhpIdByName = new Map<string, number>(
      bmhpMatRows.map((r) => [(r.name as string).toLowerCase().trim(), Number(r.id)])
    )

    // Lookup ws_bmhp_examination_target_groups → join with bmhp_examinations → get (exam_name, target_group_name, etg_id)
    const etgRows: any[] = await db
      .selectFrom("ws_bmhp_examination_target_groups")
      .innerJoin("bmhp_examinations", "bmhp_examinations.id", "ws_bmhp_examination_target_groups.examination_id")
      .innerJoin("target_groups", "target_groups.id", "ws_bmhp_examination_target_groups.target_group_id")
      .select([
        "ws_bmhp_examination_target_groups.id as etg_id",
        "bmhp_examinations.name as exam_name",
        "target_groups.title as target_group_name",
      ])
      .where("bmhp_examinations.program_plan_id", "=", planId)
      .where("bmhp_examinations.deleted_at", "is", null)
      .where("target_groups.deleted_at", "is", null)
      .execute()

    // Build lookup: (exam_name_lower, target_group_name_lower) → etg_id
    const etgByExamAndTarget = new Map<string, number>()
    for (const r of etgRows) {
      const key = `${(r.exam_name as string).toLowerCase().trim()}__${(r.target_group_name as string).toLowerCase().trim()}`
      etgByExamAndTarget.set(key, Number(r.etg_id))
    }

    // Delete existing target_materials for this plan's bmhp_materials
    const bmhpMatIds = bmhpMatRows.map((r) => Number(r.id))
    if (bmhpMatIds.length > 0) {
      for (let i = 0; i < bmhpMatIds.length; i += BATCH) {
        await db
          .deleteFrom("ws_bmhp_examination_target_materials")
          .where("bmhp_material_id", "in", bmhpMatIds.slice(i, i + BATCH))
          .execute()
      }
    }

    // Insert target materials from EXAM_TARGET_MATERIALS constant
    const toInsert: Array<{ exam_target_group_id: number; bmhp_material_id: number }> = []

    for (const etm of EXAM_TARGET_MATERIALS) {
      const etgKey = `${etm.examName.toLowerCase().trim()}__${etm.sasaranName.toLowerCase().trim()}`
      const etgId = etgByExamAndTarget.get(etgKey)
      if (!etgId) continue

      for (const bmhpName of etm.bmhps) {
        const bmhpId = bmhpIdByName.get(bmhpName.toLowerCase().trim())
        if (!bmhpId) continue
        toInsert.push({ exam_target_group_id: etgId, bmhp_material_id: bmhpId })
      }
    }

    if (toInsert.length > 0) {
      for (let i = 0; i < toInsert.length; i += BATCH) {
        await db.insertInto("ws_bmhp_examination_target_materials").values(toInsert.slice(i, i + BATCH)).execute()
      }
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const programPlanIds = await fetchBMHPPlanIds(db)
  if (programPlanIds.length === 0) return

  for (const planId of programPlanIds) {
    const bmhpMatRows: any[] = await db
      .selectFrom("bmhp_materials")
      .select("id")
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const bmhpMatIds = bmhpMatRows.map((r) => Number(r.id))

    if (bmhpMatIds.length > 0) {
      for (let i = 0; i < bmhpMatIds.length; i += BATCH) {
        await db
          .deleteFrom("ws_bmhp_examination_target_materials")
          .where("bmhp_material_id", "in", bmhpMatIds.slice(i, i + BATCH))
          .execute()
      }
    }
  }
}
