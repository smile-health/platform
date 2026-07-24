import type { Kysely } from "kysely"

/**
 * Seed bmhp_materials dari Master_Data_BMHP.xlsx
 * Kategori "Reagen" → is_reagen = 1, lainnya → is_reagen = 0
 * Cek existing by (name, program_plan_id) sebelum insert agar idempotent.
 * Insert per program_plan BMHP dengan year >= 2026.
 */
export async function up(db: Kysely<any>): Promise<void> {
  const rows = [
    { name: "Reagen diluent", is_reagen: 1, description: null },
    { name: "Reagen cleanser", is_reagen: 1, description: null },
    { name: "Reagen lyse", is_reagen: 1, description: null },
    { name: "Reagen control", is_reagen: 1, description: null },
    { name: "Reagensia Cholesterol Total", is_reagen: 1, description: null },
    { name: "Reagensia HDL Direct", is_reagen: 1, description: null },
    { name: "Reagensia LDL Direct", is_reagen: 1, description: null },
    { name: "Reagensia Trigliserida", is_reagen: 1, description: null },
    { name: "Reagen kreatinin", is_reagen: 1, description: null },
    { name: "Reagen Ureum", is_reagen: 1, description: null },
    { name: "Cartridge TCM", is_reagen: 0, description: null },
    { name: "Reagensia BTA", is_reagen: 1, description: null },
    { name: "Dental plaque disclosing", is_reagen: 1, description: null },
    { name: "Reagen SGOT", is_reagen: 1, description: null },
    { name: "Reagensia Malaria (metanol, immertion oil dan giemsa)", is_reagen: 1, description: null },
    { name: "Kapas", is_reagen: 0, description: null },
    { name: "Gel EKG", is_reagen: 0, description: null },
    { name: "Gel USG", is_reagen: 0, description: null },
    { name: "Blood Lancet", is_reagen: 0, description: null },
    { name: "Vacutainer Needle", is_reagen: 0, description: null },
    { name: "Tabung vacutainer tutup ungu (EDTA) (K2/K3)", is_reagen: 0, description: null },
    { name: "Tabung vacutainer tutup kuning", is_reagen: 0, description: null },
    { name: "Tip Kuning", is_reagen: 0, description: null },
    { name: "Alcohol Swab", is_reagen: 0, description: null },
    { name: "Handscoon", is_reagen: 0, description: null },
    { name: "plester bulat bening", is_reagen: 0, description: null },
    { name: "Strip gula darah", is_reagen: 0, description: null },
    { name: "Wing needle", is_reagen: 0, description: null },
    { name: "Strip Hb", is_reagen: 0, description: null },
    { name: "Lancet Pediatric", is_reagen: 0, description: null },
    { name: "Plester", is_reagen: 0, description: null },
    { name: "Thermal paper EKG", is_reagen: 0, description: null },
    { name: "Pot Sputum", is_reagen: 0, description: null },
    { name: "Tuberkulin Vial", is_reagen: 0, description: null },
    { name: "Rapid test Hepatitis B (HBsAg)", is_reagen: 0, description: null },
    { name: "Rapid Test HIV", is_reagen: 0, description: null },
    { name: "Rapid Test HIV dan Sifilis combo/dual", is_reagen: 0, description: null },
    { name: "Rapid Test Sifilis", is_reagen: 0, description: null },
    { name: "Glukuproteinuria", is_reagen: 0, description: null },
    { name: "Pot urine", is_reagen: 0, description: null },
    { name: "Dental Kit", is_reagen: 0, description: null },
    { name: "Fluorida Varnish", is_reagen: 0, description: null },
    { name: "Microbrush", is_reagen: 0, description: null },
    { name: "Rapid test Hepatitis C (anti HCV)", is_reagen: 0, description: null },
    { name: "Fecal OBT", is_reagen: 0, description: null },
    { name: "Pot Sample Feses", is_reagen: 0, description: null },
    { name: "Collecting Kit (cytobrush + VTM)", is_reagen: 0, description: null },
    { name: "Rapid Test Malaria", is_reagen: 0, description: null },
    { name: "Plester bulat bening", is_reagen: 0, description: null },
    { name: "Tabung vacutainer tutup ungu", is_reagen: 0, description: null },
    { name: "Vacutainer tutup merah", is_reagen: 0, description: null },
    { name: "Tabung vacutainer tutup ungu (EDTA)", is_reagen: 0, description: null },
    { name: "Kertas Saring", is_reagen: 0, description: null },
    { name: "Plastik klip", is_reagen: 0, description: null },
    { name: "Cawan", is_reagen: 0, description: null },
    { name: "Celemek Dental", is_reagen: 0, description: null },
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
    .selectFrom("bmhp_materials")
    .select(["name", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const existingSet = new Set(existing.map((r) => `${r.name}__${r.program_plan_id}`))

  const toInsert: Array<{ name: string; is_reagen: number; description: null; program_plan_id: number }> = []
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
      await db.insertInto("bmhp_materials").values(toInsert.slice(i, i + BATCH)).execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const names = [
    "Reagen diluent",
    "Reagen cleanser",
    "Reagen lyse",
    "Reagen control",
    "Reagensia Cholesterol Total",
    "Reagensia HDL Direct",
    "Reagensia LDL Direct",
    "Reagensia Trigliserida",
    "Reagen kreatinin",
    "Reagen Ureum",
    "Cartridge TCM",
    "Reagensia BTA",
    "Dental plaque disclosing",
    "Reagen SGOT",
    "Reagensia Malaria (metanol, immertion oil dan giemsa)",
    "Kapas",
    "Gel EKG",
    "Gel USG",
    "Blood Lancet",
    "Vacutainer Needle",
    "Tabung vacutainer tutup ungu (EDTA) (K2/K3)",
    "Tabung vacutainer tutup kuning",
    "Tip Kuning",
    "Alcohol Swab",
    "Handscoon",
    "plester bulat bening",
    "Strip gula darah",
    "Wing needle",
    "Strip Hb",
    "Lancet Pediatric",
    "Plester",
    "Thermal paper EKG",
    "Pot Sputum",
    "Tuberkulin Vial",
    "Rapid test Hepatitis B (HBsAg)",
    "Rapid Test HIV",
    "Rapid Test HIV dan Sifilis combo/dual",
    "Rapid Test Sifilis",
    "Glukuproteinuria",
    "Pot urine",
    "Dental Kit",
    "Fluorida Varnish",
    "Microbrush",
    "Rapid test Hepatitis C (anti HCV)",
    "Fecal OBT",
    "Pot Sample Feses",
    "Collecting Kit (cytobrush + VTM)",
    "Rapid Test Malaria",
    "Plester bulat bening",
    "Tabung vacutainer tutup ungu",
    "Vacutainer tutup merah",
    "Tabung vacutainer tutup ungu (EDTA)",
    "Kertas Saring",
    "Plastik klip",
    "Cawan",
    "Celemek Dental",
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
    .deleteFrom("bmhp_materials")
    .where("name", "in", names)
    .where("program_plan_id", "in", programPlanIds)
    .execute()
}
