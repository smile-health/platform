import type { Kysely } from "kysely"

/**
 * Seed bmhp_examinations (19 pemeriksaan) beserta child tables:
 *   - bmhp_target_groups          (40 sasaran, global/shared antar plan)
 *   - ws_bmhp_examination_parameters   (exam → parameter, per plan)
 *   - ws_bmhp_examination_target_groups (exam → target_group, per plan)
 *   - ws_bmhp_examination_target_materials (exam_target_group → bmhp_material, per plan)
 *
 * Source: Master_Data_Relasi_Pemeriksaan_by_Parameter.md
 * Total: 19 pemeriksaan, 30 parameter, 40 sasaran, 233 baris relasi
 *
 * Dependency:
 *   - migration 001: bmhp_examination_types sudah ter-seed (6 types per plan)
 *   - migration 003: bmhp_materials sudah ter-seed per plan
 *   - migration 009: bmhp_parameters sudah ter-seed per plan
 */

// ─── Master data ──────────────────────────────────────────────────────────────

const TARGET_GROUPS: Array<{ name: string; code: string }> = [
  { name: "Balita Usia 2 Tahun dengan Anemia", code: "BTGS-001" },
  { name: "Balita Usia 3-6 Tahun dengan Risiko Talasemia", code: "BTGS-002" },
  { name: "Kelas 7 dengan Anemia", code: "BTGS-003" },
  { name: "Kelas 8-12 (13-17 tahun) dengan faktor risiko Talasemia", code: "BTGS-004" },
  { name: "Ibu Hamil", code: "BTGS-005" },
  { name: "Balita Usia 2 Tahun", code: "BTGS-006" },
  { name: "Remaja Putri Kelas 10 (16 thn)", code: "BTGS-007" },
  { name: "Siswa Kelas 7 (13 thn)", code: "BTGS-008" },
  { name: "Catin Perempuan (18-49 thn)", code: "BTGS-009" },
  { name: "Anak Usia Sekolah (7-12 thn) dengan Faktor Risiko", code: "BTGS-010" },
  { name: "Balita Usia 3-6 Tahun dengan Risiko", code: "BTGS-011" },
  { name: "Dewasa Usia 18-59 Tahun", code: "BTGS-012" },
  { name: "Siswa Kelas 10-12 (16-17 thn)", code: "BTGS-013" },
  { name: "Siswa Kelas 8-9 dengan Faktor Risiko", code: "BTGS-014" },
  { name: "Lansia (Umum)", code: "BTGS-015" },
  { name: "Catin Laki-laki & Perempuan (18-49 thn)", code: "BTGS-016" },
  { name: "Siswa Kelas 7-12 dengan Risiko Hepatitis C", code: "BTGS-017" },
  { name: "Lansia >= 60 thn dengan Risiko Hepatitis C", code: "BTGS-018" },
  { name: "Dewasa 18-59 thn dengan Risiko Hepatitis C", code: "BTGS-019" },
  { name: "Siswa Kelas 1-12 dengan Risiko Hepatitis B", code: "BTGS-020" },
  { name: "Lansia >= 60 thn dengan Risiko Hepatitis B", code: "BTGS-021" },
  { name: "Dewasa 18-59 thn dengan Risiko Hepatitis B", code: "BTGS-022" },
  { name: "Estimasi Kasus TB Semua Usia", code: "BTGS-023" },
  { name: "Estimasi Kasus TB Anak 0-14 thn", code: "BTGS-024" },
  { name: "Laki-laki dan Perempuan usia >= 45 tahun", code: "BTGS-025" },
  { name: "Dewasa Usia 40-59 Tahun dengan HT & DM", code: "BTGS-026" },
  { name: "Lansia >= 60 thn dengan HT & DM", code: "BTGS-027" },
  { name: "Seluruh Usia", code: "BTGS-028" },
  { name: "Seluruh Usia (Wilayah Endemis Tinggi)", code: "BTGS-029" },
  { name: "Suspek Malaria (Wilayah Endemis)", code: "BTGS-030" },
  { name: "Anak Usia Sekolah Kelas 1-6 (7-12 thn)", code: "BTGS-031" },
  { name: "Perempuan 30-69 thn (Skrining Kanker)", code: "BTGS-032" },
  { name: "Bayi Baru Lahir (SHK)", code: "BTGS-033" },
  { name: "Usia > 18 Tahun", code: "BTGS-034" },
  { name: "Usia > 40 tahun", code: "BTGS-035" },
  { name: "Prevalensi Hepatitis B (2,4%)", code: "BTGS-036" },
  { name: "Prevalensi Hepatitis C (0,5%)", code: "BTGS-037" },
  { name: "Prevalensi Obesitas sentral (36,8%)", code: "BTGS-038" },
  { name: "Prevalensi Dislipidemia (8,8%)", code: "BTGS-039" },
  { name: "Prevalensi Diabetes Melitus (11,7%)", code: "BTGS-040" },
]

// 9 BMHP yang sama untuk semua sasaran Talasemia
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

// 10 BMHP untuk Profil Lipid
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

// 12 BMHP untuk Fibrosis/Sirosis
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

type ExamDef = {
  name: string
  typeName: string
  parameters: string[]
  targetMaterials: Array<{ sasaran: string; bmhps: string[] }>
}

const EXAMS: ExamDef[] = [
  {
    name: "Anemia",
    typeName: "Hematologi",
    parameters: ["Hemoglobin, penetapan kadar"],
    targetMaterials: [
      { sasaran: "Balita Usia 2 Tahun", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Ibu Hamil", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Remaja Putri Kelas 10 (16 thn)", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Siswa Kelas 7 (13 thn)", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Catin Perempuan (18-49 thn)", bmhps: ["Strip Hb", "Alcohol Swab", "Blood Lancet"] },
    ],
  },
  {
    name: "Fibrosis/Sirosis",
    typeName: "Kimia Klinik",
    parameters: ["SGOT, penetapan kadar"],
    targetMaterials: [
      { sasaran: "Usia > 18 Tahun", bmhps: FIBROSIS_BMHPS },
      { sasaran: "Usia > 40 tahun", bmhps: FIBROSIS_BMHPS },
      { sasaran: "Prevalensi Hepatitis B (2,4%)", bmhps: FIBROSIS_BMHPS },
      { sasaran: "Prevalensi Obesitas sentral (36,8%)", bmhps: FIBROSIS_BMHPS },
      { sasaran: "Prevalensi Dislipidemia (8,8%)", bmhps: FIBROSIS_BMHPS },
      { sasaran: "Prevalensi Diabetes Melitus (11,7%)", bmhps: FIBROSIS_BMHPS },
      { sasaran: "Prevalensi Hepatitis C (0,5%)", bmhps: FIBROSIS_BMHPS },
    ],
  },
  {
    name: "Fungsi Ginjal",
    typeName: "Kimia Klinik",
    parameters: ["Kreatinin, penetapan kadar"],
    targetMaterials: [
      {
        sasaran: "Dewasa Usia 40 - 59 Tahun dengan HT & DM",
        bmhps: ["Reagen kreatinin", "Reagen Ureum", "Handscoon", "Tabung vacutainer tutup kuning", "Tip Kuning", "Vacutainer Needle"],
      },
      {
        sasaran: "Lansia ≥ 60 thn dengan HT & DM",
        bmhps: ["Reagen kreatinin", "Reagen Ureum", "Handscoon", "Tabung vacutainer tutup kuning", "Tip Kuning", "Vacutainer Needle"],
      },
    ],
  },
  {
    name: "Gigi",
    typeName: "-",
    parameters: [],
    targetMaterials: [
      {
        sasaran: "Anak Usia Sekolah Kelas 1-6 (7-12 thn)",
        bmhps: ["Dental plaque disclosing", "Kapas", "Dental Kit", "Fluorida Varnish", "Microbrush", "Cawan", "Celemek Dental"],
      },
    ],
  },
  {
    name: "Gula Darah",
    typeName: "Kimia Klinik",
    parameters: ["Glukosa, penetapan kadar"],
    targetMaterials: [
      { sasaran: "Anak Usia Sekolah (7-12 thn) dengan Faktor Risiko", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Balita Usia 3-6 Tahun dengan Risiko", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Balita Usia 2 Tahun", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Dewasa Usia 18 - 59 Tahun", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Ibu Hamil", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Siswa Kelas 10-12 (16-17 thn)", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Siswa Kelas 8-9 dengan Faktor Risiko", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Lansia (Umum)", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
      { sasaran: "Siswa Kelas 7 (13 thn)", bmhps: ["Strip gula darah", "Alcohol Swab", "Blood Lancet"] },
    ],
  },
  {
    name: "HIV dan Sifilis",
    typeName: "Mikrobiologi Klinik, Parasitologi dan Imunologi",
    parameters: ["Anti HIV, kualitatif"],
    targetMaterials: [
      {
        sasaran: "Ibu Hamil",
        bmhps: ["Rapid Test HIV", "Rapid Test HIV dan Sifilis combo/dual", "Rapid Test Sifilis"],
      },
      {
        sasaran: "Catin Laki-laki & Perempuan (18-49 thn)",
        bmhps: ["Rapid Test HIV", "Rapid Test HIV dan Sifilis combo/dual", "Rapid Test Sifilis"],
      },
    ],
  },
  {
    name: "Hepatitis B",
    typeName: "Mikrobiologi Klinik, Parasitologi dan Imunologi",
    parameters: ["HBsAg, kualitatif"],
    targetMaterials: [
      { sasaran: "Ibu Hamil", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
      { sasaran: "Siswa Kelas 1-12 dengan Risiko Hepatitis B", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
      { sasaran: "Lansia ≥ 60 thn dengan Risiko Hepatitis B", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
      { sasaran: "Dewasa 18-59 thn dengan Risiko Hepatitis B", bmhps: ["Rapid test Hepatitis B (HBsAg)"] },
    ],
  },
  {
    name: "Hepatitis C",
    typeName: "Mikrobiologi Klinik, Parasitologi dan Imunologi",
    parameters: ["Anti HCV, kualitatif"],
    targetMaterials: [
      { sasaran: "Siswa Kelas 7-12 dengan Risiko Hepatitis C", bmhps: ["Rapid test Hepatitis C (anti HCV)"] },
      { sasaran: "Lansia ≥ 60 thn dengan Risiko Hepatitis C", bmhps: ["Rapid test Hepatitis C (anti HCV)"] },
      { sasaran: "Dewasa 18-59 thn dengan Risiko Hepatitis C", bmhps: ["Rapid test Hepatitis C (anti HCV)"] },
    ],
  },
  {
    name: "Kanker Leher Rahim",
    typeName: "-",
    parameters: [],
    targetMaterials: [
      { sasaran: "Perempuan 30-69 thn (Skrining Kanker)", bmhps: ["Collecting Kit (cytobrush + VTM)"] },
    ],
  },
  {
    name: "Kanker Payudara",
    typeName: "-",
    parameters: [],
    targetMaterials: [
      { sasaran: "Perempuan 30-69 thn (Skrining Kanker)", bmhps: ["Gel USG"] },
    ],
  },
  {
    name: "Kanker Usus",
    typeName: "Feses (Tinja)",
    parameters: ["Darah samar"],
    targetMaterials: [
      {
        sasaran: "Laki-laki dan Perempuan usia ≥ 45 tahun",
        bmhps: ["Fecal OBT", "Handscoon", "Pot Sample Feses"],
      },
    ],
  },
  {
    name: "Kehamilan",
    typeName: "-",
    parameters: ["Tes Kehamilan, kualitatif"],
    targetMaterials: [
      { sasaran: "Ibu Hamil", bmhps: ["Gel USG"] },
    ],
  },
  {
    name: "Malaria",
    typeName: "Mikrobiologi Klinik, Parasitologi dan Imunologi",
    parameters: ["Malaria, kuantitatif"],
    targetMaterials: [
      { sasaran: "Seluruh Usia", bmhps: ["Reagensia Malaria (metanol, immertion oil dan giemsa)"] },
      { sasaran: "Seluruh Usia (Wilayah Endemis Tinggi)", bmhps: ["Rapid Test Malaria"] },
      { sasaran: "Suspek Malaria (Wilayah Endemis)", bmhps: ["Rapid Test Malaria"] },
    ],
  },
  {
    name: "Profil Lipid",
    typeName: "Kimia Klinik",
    parameters: [
      "Kolesterol total, penetapan kadar",
      "Trigliserida, penetapan kadar",
      "Kolesterol HDL, penetapan kadar",
      "Kolesterol LDL",
    ],
    targetMaterials: [
      { sasaran: "Dewasa Usia 40-59 Tahun dengan HT & DM", bmhps: LIPID_BMHPS },
      { sasaran: "Lansia ≥ 60 thn dengan HT & DM", bmhps: LIPID_BMHPS },
    ],
  },
  {
    name: "Proteinuria",
    typeName: "Urinalisis",
    parameters: [
      "pH, kuantitatif",
      "Berat Jenis, kuantitatif",
      "Protein, semi kuantitatif",
      "Glukosa, semi kuantitatif",
      "Bilirubin, semi kuantitatif",
      "Urobilinogen, kuantitatif",
      "Keton, semi kuantitatif",
      "Nitrit, semi kuantitatif",
      "Darah samar, semi kuantitatif",
    ],
    targetMaterials: [
      { sasaran: "Ibu Hamil", bmhps: ["Glukuproteinuria", "Pot urine"] },
    ],
  },
  {
    name: "Risiko Jantung",
    typeName: "-",
    parameters: [],
    targetMaterials: [
      { sasaran: "Lansia ≥ 60 thn dengan HT & DM", bmhps: ["Gel EKG", "Thermal paper EKG"] },
      { sasaran: "Dewasa Usia 40-59 Tahun dengan HT & DM", bmhps: ["Gel EKG", "Thermal paper EKG"] },
    ],
  },
  {
    name: "SHK, G6PD, SHAK",
    typeName: "-",
    parameters: [],
    targetMaterials: [
      {
        sasaran: "Bayi Baru Lahir (SHK)",
        bmhps: ["Alcohol Swab", "Handscoon", "Lancet Pediatric", "Plester", "Kertas Saring", "Plastik klip"],
      },
    ],
  },
  {
    name: "Talasemia Lanjutan (pemeriksaan darah lengkap)",
    typeName: "Hematologi",
    parameters: [
      "Hemoglobin, penetapan kadar",
      "Hematokrit, penetapan nilai",
      "Eritrosit, hitung jumlah",
      "Indeks Eritrosit (MCV, MCH, CHC), penetapan nilai",
      "Trombosit, hitung jumlah",
      "Leukosit, hitung jumlah",
    ],
    targetMaterials: [
      { sasaran: "Balita Usia 2 Tahun dengan Anemia", bmhps: THALASSEMIA_BMHPS },
      { sasaran: "Balita Usia 3-6 Tahun dengan Risiko Talasemia", bmhps: THALASSEMIA_BMHPS },
      { sasaran: "Kelas 7 dengan Anemia", bmhps: THALASSEMIA_BMHPS },
      { sasaran: "Kelas 8-12 (13-17 tahun) dengan faktor risiko Talasemia", bmhps: THALASSEMIA_BMHPS },
    ],
  },
  {
    name: "Tuberkulosis",
    typeName: "Mikrobiologi Klinik, Parasitologi dan Imunologi",
    parameters: ["BTA Mycobacterium Tuberculosis (semi kuantitatif)"],
    targetMaterials: [
      { sasaran: "Estimasi Kasus TB (Semua Usia)", bmhps: ["Cartridge TCM", "Reagensia BTA", "Pot Sputum"] },
      { sasaran: "Estimasi Kasus TB Anak (0-14 thn)", bmhps: ["Tuberkulin Vial"] },
    ],
  },
]

// ─── up() ─────────────────────────────────────────────────────────────────────

export async function up(db: Kysely<any>): Promise<void> {
  // Lookup approach_id BMHP
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

  // ── Step 1: Seed bmhp_target_groups (global) ──────────────────────────────
  const existingTg: any[] = await db
    .selectFrom("bmhp_target_groups")
    .select(["name", "code"])
    .where("deleted_at", "is", null)
    .execute()
  const existingTgNames = new Set(existingTg.map((r: any) => r.name.toLowerCase().trim()))
  const existingTgCodes = new Set(existingTg.map((r: any) => r.code))

  const tgToInsert = TARGET_GROUPS.filter(
    (tg) => !existingTgNames.has(tg.name.toLowerCase().trim()) && !existingTgCodes.has(tg.code)
  )
  if (tgToInsert.length > 0) {
    await db.insertInto("bmhp_target_groups").values(tgToInsert).execute()
  }

  // Build target_group name→id map dari target_groups (FK references target_groups.id)
  const allTgRows: any[] = await db
    .selectFrom("target_groups")
    .select(["id", "title"])
    .where("deleted_at", "is", null)
    .execute()
  const tgIdByName = new Map<string, number>(
    allTgRows.map((r: any) => [r.title.toLowerCase().trim(), Number(r.id)])
  )

  // ── Step 2: Per program_plan ───────────────────────────────────────────────
  for (const planId of programPlanIds) {
    // Fetch examination types for this plan (name → id)
    const typeRows: any[] = await db
      .selectFrom("bmhp_examination_types")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const typeIdByName = new Map<string, number>(
      typeRows.map((r: any) => [r.name.toLowerCase().trim(), Number(r.id)])
    )

    // Fetch parameters for this plan (name → id)
    const paramRows: any[] = await db
      .selectFrom("bmhp_parameters")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const paramIdByName = new Map<string, number>(
      paramRows.map((r: any) => [r.name.toLowerCase().trim(), Number(r.id)])
    )

    // Fetch bmhp_materials for this plan (name lower → [id]) — case-insensitive, multiple possible
    const bmhpMatRows: any[] = await db
      .selectFrom("bmhp_materials")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const bmhpIdsByName = new Map<string, number[]>()
    for (const r of bmhpMatRows) {
      const key = r.name.toLowerCase().trim()
      if (!bmhpIdsByName.has(key)) bmhpIdsByName.set(key, [])
      bmhpIdsByName.get(key)!.push(Number(r.id))
    }

    // Existing examinations for idempotency
    const existingExams: any[] = await db
      .selectFrom("bmhp_examinations")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const existingExamNames = new Set(existingExams.map((r: any) => r.name.toLowerCase().trim()))
    const examIdByName = new Map<string, number>(
      existingExams.map((r: any) => [r.name.toLowerCase().trim(), Number(r.id)])
    )

    // ── 2a. Seed bmhp_examinations ──────────────────────────────────────────
    for (const exam of EXAMS) {
      if (!existingExamNames.has(exam.name.toLowerCase().trim())) {
        const typeId = typeIdByName.get(exam.typeName.toLowerCase().trim())
        const result = await db
          .insertInto("bmhp_examinations")
          .values({
            name: exam.name,
            examination_type_id: typeId ?? null,
            is_active: 1,
            program_plan_id: planId,
          })
          .executeTakeFirst()
        examIdByName.set(exam.name.toLowerCase().trim(), Number(result.insertId))
      }
    }

    // Existing params bridge (examination_id, parameter_id) for idempotency
    const examIds = [...examIdByName.values()]
    let existingExamParams = new Set<string>()
    if (examIds.length > 0) {
      const epRows: any[] = await db
        .selectFrom("ws_bmhp_examination_parameters")
        .select(["examination_id", "parameter_id"])
        .where("examination_id", "in", examIds)
        .execute()
      existingExamParams = new Set(epRows.map((r: any) => `${r.examination_id}|${r.parameter_id}`))
    }

    // ── 2b. Seed ws_bmhp_examination_parameters ─────────────────────────────
    const epToInsert: Array<{ examination_id: number; parameter_id: number; sort_order: number }> = []
    for (const exam of EXAMS) {
      const examId = examIdByName.get(exam.name.toLowerCase().trim())
      if (!examId) continue
      exam.parameters.forEach((paramName, idx) => {
        const paramId = paramIdByName.get(paramName.toLowerCase().trim())
        if (!paramId) return
        const key = `${examId}|${paramId}`
        if (!existingExamParams.has(key)) {
          epToInsert.push({ examination_id: examId, parameter_id: paramId, sort_order: idx + 1 })
          existingExamParams.add(key)
        }
      })
    }
    if (epToInsert.length > 0) {
      const BATCH = 50
      for (let i = 0; i < epToInsert.length; i += BATCH) {
        await db.insertInto("ws_bmhp_examination_parameters").values(epToInsert.slice(i, i + BATCH)).execute()
      }
    }

    // Existing exam_target_groups (examination_id, target_group_id) — unique constraint
    let existingEtg = new Set<string>()
    if (examIds.length > 0) {
      const etgRows: any[] = await db
        .selectFrom("ws_bmhp_examination_target_groups")
        .select(["id", "examination_id", "target_group_id"])
        .where("examination_id", "in", examIds)
        .execute()
      existingEtg = new Set(etgRows.map((r: any) => `${r.examination_id}|${r.target_group_id}`))
    }

    // ── 2c. Seed ws_bmhp_examination_target_groups + ws_bmhp_examination_target_materials ──
    for (const exam of EXAMS) {
      const examId = examIdByName.get(exam.name.toLowerCase().trim())
      if (!examId) continue

      for (const tm of exam.targetMaterials) {
        const tgId = tgIdByName.get(tm.sasaran.toLowerCase().trim())
        if (!tgId) continue

        // Insert ws_bmhp_examination_target_groups if not exists
        const etgKey = `${examId}|${tgId}`
        let etgId: number
        if (!existingEtg.has(etgKey)) {
          const etgResult = await db
            .insertInto("ws_bmhp_examination_target_groups")
            .values({ examination_id: examId, target_group_id: tgId })
            .executeTakeFirst()
          etgId = Number(etgResult.insertId)
          existingEtg.add(etgKey)
        } else {
          // Fetch existing etg id
          const etgRow: any = await db
            .selectFrom("ws_bmhp_examination_target_groups")
            .select("id")
            .where("examination_id", "=", examId)
            .where("target_group_id", "=", tgId)
            .executeTakeFirst()
          etgId = Number(etgRow.id)
        }

        // Existing target_materials for this etgId (idempotent)
        const existingTmRows: any[] = await db
          .selectFrom("ws_bmhp_examination_target_materials")
          .select("bmhp_material_id")
          .where("exam_target_group_id", "=", etgId)
          .where("deleted_at", "is", null)
          .execute()
        const existingTmSet = new Set(existingTmRows.map((r: any) => Number(r.bmhp_material_id)))

        // Insert target materials
        const tmToInsert: Array<{ exam_target_group_id: number; bmhp_material_id: number }> = []
        for (const bmhpName of tm.bmhps) {
          const bmhpIds = bmhpIdsByName.get(bmhpName.toLowerCase().trim()) ?? []
          for (const bmhpId of bmhpIds) {
            if (!existingTmSet.has(bmhpId)) {
              tmToInsert.push({ exam_target_group_id: etgId, bmhp_material_id: bmhpId })
              existingTmSet.add(bmhpId)
            }
          }
        }
        if (tmToInsert.length > 0) {
          await db.insertInto("ws_bmhp_examination_target_materials").values(tmToInsert).execute()
        }
      }
    }
  }
}

// ─── down() ───────────────────────────────────────────────────────────────────

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
  const examNames = EXAMS.map((e) => e.name)

  // Fetch exam IDs yang di-seed migration ini
  const examRows: any[] = await db
    .selectFrom("bmhp_examinations")
    .select("id")
    .where("name", "in", examNames)
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const examIds = examRows.map((r: any) => Number(r.id))

  if (examIds.length > 0) {
    // Fetch exam_target_group IDs
    const etgRows: any[] = await db
      .selectFrom("ws_bmhp_examination_target_groups")
      .select("id")
      .where("examination_id", "in", examIds)
      .execute()
    const etgIds = etgRows.map((r: any) => Number(r.id))

    // Delete ws_bmhp_examination_target_materials
    if (etgIds.length > 0) {
      const BATCH = 50
      for (let i = 0; i < etgIds.length; i += BATCH) {
        await db
          .deleteFrom("ws_bmhp_examination_target_materials")
          .where("exam_target_group_id", "in", etgIds.slice(i, i + BATCH))
          .execute()
      }
    }

    // Delete ws_bmhp_examination_target_groups
    await db.deleteFrom("ws_bmhp_examination_target_groups").where("examination_id", "in", examIds).execute()

    // Delete ws_bmhp_examination_parameters
    await db.deleteFrom("ws_bmhp_examination_parameters").where("examination_id", "in", examIds).execute()

    // Delete bmhp_examinations
    await db.deleteFrom("bmhp_examinations").where("id", "in", examIds).execute()
  }

  // Delete bmhp_target_groups yang di-seed migration ini
  const tgCodes = TARGET_GROUPS.map((tg) => tg.code)
  await db.deleteFrom("bmhp_target_groups").where("code", "in", tgCodes).execute()
}
