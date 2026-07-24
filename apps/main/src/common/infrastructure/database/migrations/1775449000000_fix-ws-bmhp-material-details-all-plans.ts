import type { Kysely } from "kysely"

const BMHP_MERK_PAIRS: Array<{ bmhp: string; merk: string }> = [
  { bmhp: "Fluorida Varnish", merk: "Dental varnish" },
  { bmhp: "Plester", merk: "Medical adhesive tape" },
  { bmhp: "Strip Hb", merk: "Hemoglobin test strip" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove L Nitrile Powder Free Non Steril" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove M Latex Powder free Non Steril" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove M Latex Powdered/Pre Powdered Non Steril" },
  { bmhp: "Reagen lyse", merk: "Blood cell diluents" },
  { bmhp: "Reagen diluent", merk: "Blood cell diluents" },
  { bmhp: "Tabung vacutainer tutup ungu (EDTA)", merk: "Vacuum Blood Collection Tube K3 EDTA PET 3 mL" },
  { bmhp: "Tabung vacutainer tutup ungu (EDTA)", merk: "Vacuum Blood Collection Tube K2 EDTA PET 2 mL" },
  { bmhp: "Tabung vacutainer tutup ungu (EDTA)", merk: "Vacuum Blood Collection Tube K2 EDTA PET 3 mL" },
  { bmhp: "Vacutainer tutup merah", merk: "Vacuum Blood Collection Tube Plain PET 3 mL" },
  { bmhp: "Blood Lancet", merk: "Lancet Stainless" },
  { bmhp: "Lancet Pediatric", merk: "Lancet Stainless" },
  { bmhp: "Tip Kuning", merk: "Micropippette Tips" },
  { bmhp: "Rapid test Hepatitis B (HBsAg)", merk: "HBsAg Test Card" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove M Nitrile Powder Free Non Steril" },
  { bmhp: "Strip gula darah", merk: "Glucose Test Strip" },
  { bmhp: "Blood Lancet", merk: "Disposable lancet 28G" },
  { bmhp: "Lancet Pediatric", merk: "Disposable lancet 28G" },
  { bmhp: "Rapid Test Sifilis", merk: "Treponema pallidum treponemal antibody test card/cassette" },
  { bmhp: "Reagensia Cholesterol Total", merk: "Cholesterol (total) test kit" },
  { bmhp: "Reagen kreatinin", merk: "Creatine test reagen kit" },
  { bmhp: "Reagensia HDL Direct", merk: "High density lipoprotein (HDL) test kit" },
  { bmhp: "Reagen SGOT", merk: "AST/SGOT test kit" },
  { bmhp: "Reagensia Trigliserida", merk: "Triglyceride test kit" },
  { bmhp: "Reagen Ureum", merk: "Urea nitrogen test reagen kit" },
  { bmhp: "Rapid Test HIV", merk: "HIV test card/ cassette" },
  { bmhp: "Rapid test Hepatitis B (HBsAg)", merk: "HBsAg Test Strip" },
  { bmhp: "Rapid test Hepatitis C (anti HCV)", merk: "HCV Test Card/Cassette" },
  { bmhp: "Collecting Kit (cytobrush + VTM)", merk: "Collection swab & virus sampling tube" },
  { bmhp: "Reagensia BTA", merk: "Dye and Chemical Solution Stains Ziehl Neelsen Solution" },
  { bmhp: "Alcohol Swab", merk: "Alcohol Swab" },
  { bmhp: "Reagen diluent", merk: "Alc" },
  { bmhp: "Rapid Test Malaria", merk: "Malaria Test Card/Cassette" },
  { bmhp: "Reagensia HDL Direct", merk: "Lipoprotein test reagent kit" },
  { bmhp: "Rapid test Hepatitis C (anti HCV)", merk: "HCV Reagent Test Strip" },
  { bmhp: "Pot urine", merk: "Specimen container sterile 60 mL" },
  { bmhp: "Pot Sputum", merk: "Specimen container sterile 60 mL" },
  { bmhp: "Vacutainer tutup merah", merk: "Vacuum Blood Collection Tube Clot Activator PET 3 mL" },
  { bmhp: "Vacutainer tutup merah", merk: "Vacuum Blood Collection Tube Clot Activator PET 2 mL" },
  { bmhp: "Tabung vacutainer tutup kuning", merk: "Vacuum Blood Collection Tube Gel and Clot Activator PET 2 mL" },
  { bmhp: "Tabung vacutainer tutup kuning", merk: "Vacuum Blood Collection Tube Gel and Clot Activator PET 3 mL" },
  { bmhp: "Tabung vacutainer tutup ungu (EDTA)", merk: "Vacuum Blood Collection Tube K3 EDTA PET 2 mL" },
  { bmhp: "Collecting Kit (cytobrush + VTM)", merk: "Viral transport medium (VTM)" },
  { bmhp: "Handscoon", merk: "Patient examination glove L latex powder free non steril" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove S Latex Powder free Non Steril" },
  { bmhp: "Reagensia Malaria (metanol, immertion oil dan giemsa)", merk: "Bahan Pemeriksaan Malaria" },
  { bmhp: "Gel USG", merk: "Ultrasound gel" },
  { bmhp: "Gel EKG", merk: "Ultrasound gel" },
  { bmhp: "Dental plaque disclosing", merk: "Plaque Disclosing Solution" },
  { bmhp: "Fluorida Varnish", merk: "Dental varnish with flouride liquid" },
  { bmhp: "Vacutainer Needle", merk: "Blood collection safety holder disposable" },
  { bmhp: "Wing needle", merk: "Wing needle blood collection set" },
  { bmhp: "Reagensia Cholesterol Total", merk: "Cholesterol (total) test reagent" },
  { bmhp: "Reagen control", merk: "Clinical chemistry calibrator liquid" },
  { bmhp: "Rapid Test HIV dan Sifilis combo/dual", merk: "Multiple Autoantibodies Test" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (14 parameters)" },
  { bmhp: "Reagen lyse", merk: "Red cell lysing reagent" },
  { bmhp: "Thermal paper EKG", merk: "ECG Paper" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton (kapas pembalut) 250 gr" },
  { bmhp: "Collecting Kit (cytobrush + VTM)", merk: "Vaginal Self Collection and Transport Swab" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton (kapas pembalut) 100 gr" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton (kapas pembalut) 500 gr" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove L Latex Powdered/Pre Powdered Non Steril" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove S Latex Powdered/Pre Powdered Non Steril" },
  { bmhp: "Reagen kreatinin", merk: "Creatinine test kit" },
  { bmhp: "Reagensia HDL Direct", merk: "High density lipoprotein (HDL) test reagent" },
  { bmhp: "Reagen Ureum", merk: "Urea nitrogen test reagent" },
  { bmhp: "Reagen control", merk: "Lain-lain" },
  { bmhp: "Rapid Test HIV", merk: "HIV & Syphilis Rapid Test" },
  { bmhp: "Rapid Test HIV dan Sifilis combo/dual", merk: "HIV & Syphilis Rapid Test" },
  { bmhp: "Dental Kit", merk: "Dental restorative set" },
  { bmhp: "Dental Kit", merk: "Dental surgical set" },
  { bmhp: "Pot Sample Feses", merk: "Specimen transport and storage container non steril" },
  { bmhp: "Reagensia Cholesterol Total", merk: "Lain-lain" },
  { bmhp: "Reagensia LDL Direct", merk: "Lipoprotein test reagent kit" },
  { bmhp: "Reagen lyse", merk: "Lyse reagent" },
  { bmhp: "plester bulat bening", merk: "Adhesive bandage steril" },
  { bmhp: "Plester", merk: "Adhesive bandage steril" },
  { bmhp: "Plester bulat bening", merk: "Adhesive bandage steril" },
  { bmhp: "Pot Sputum", merk: "Specimen transport and storage container steril" },
  { bmhp: "Pot urine", merk: "Specimen transport and storage container steril" },
  { bmhp: "Fecal OBT", merk: "Occult blood test Cassette" },
  { bmhp: "Kapas", merk: "Stick swab (cotton/ flock)" },
  { bmhp: "Cartridge TCM", merk: "MTB and resistance RIF & INH (MDR TB) molecular tests" },
  { bmhp: "Reagen kreatinin", merk: "Lain-lain" },
  { bmhp: "Reagensia HDL Direct", merk: "Cholesterol (total) test kit" },
  { bmhp: "Reagensia LDL Direct", merk: "Lain-lain" },
  { bmhp: "Reagensia Trigliserida", merk: "Lain-lain" },
  { bmhp: "Reagen Ureum", merk: "Lain-lain" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (10 parameters)" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (3 parameters)" },
  { bmhp: "Reagen diluent", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Reagen cleanser", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Reagen lyse", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton stick" },
  { bmhp: "Reagen cleanser", merk: "General purpose solution for in vitro diagnostik" },
  { bmhp: "Reagen cleanser", merk: "Cleaning solution" },
  { bmhp: "Reagen control", merk: "Hematology Quality Control Mixture" },
  { bmhp: "Reagensia LDL Direct", merk: "Cholesterol (total) test kit" },
  { bmhp: "Fluorida Varnish", merk: "Dental varnish with flouride gel" },
  { bmhp: "Reagensia BTA", merk: "Immersion Oil" },
  { bmhp: "Reagensia Malaria (metanol, immertion oil dan giemsa)", merk: "Immersion Oil" },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 27 G" },
  { bmhp: "Kapas", merk: "Cotton Applicators Wood Tidak Steril" },
  { bmhp: "Kapas", merk: "Cotton Applicators Wood Steril" },
  { bmhp: "Reagensia LDL Direct", merk: "Low density lipoprotein (LDL) test kit" },
  { bmhp: "Reagen SGOT", merk: "Lain-lain" },
  { bmhp: "Reagensia LDL Direct", merk: "Cholesterol (total) test reagent" },
  { bmhp: "Reagensia Trigliserida", merk: "Triglyceride test reagent" },
  { bmhp: "Microbrush", merk: "Micro brush for fluoride varnish" },
  { bmhp: "Reagen cleanser", merk: "Cleanser/ wash solution for instrument" },
  { bmhp: "Reagen cleanser", merk: "Hematology Analyzer Reagent Kit 3 Diff" },
  { bmhp: "Reagen lyse", merk: "Hematology Analyzer Reagent Kit 3 Diff" },
  { bmhp: "Reagen diluent", merk: "Hematology Analyzer Reagent Kit 3 Diff" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove XS Latex Powdered/Pre Powdered Non Steril" },
  { bmhp: "Handscoon", merk: "Patient examination glove XL latex powdered/pre powdered non steril" },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 23 G" },
  { bmhp: "Blood Lancet", merk: "Disposable lancet 26G" },
  { bmhp: "Gel EKG", merk: "Electrode gel" },
  { bmhp: "Gel USG", merk: "Electrode gel" },
  { bmhp: "Celemek Dental", merk: "Dental bib disposable" },
  { bmhp: "Handscoon", merk: "Patient examination glove L latex powder free steril" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove M Latex Powder free Steril" },
  { bmhp: "Handscoon", merk: "Patient examination glove S latex powder free steril" },
  { bmhp: "Handscoon", merk: "Patient Examination Glove L Nitrile Powder Free Steril" },
  { bmhp: "Handscoon", merk: "Patient examination glove M nitrile powder free steril" },
  { bmhp: "Handscoon", merk: "Patient examination glove S nitrile powder free steril" },
  { bmhp: "Plester", merk: "Non Woven Adhesive" },
  { bmhp: "Plester", merk: "Adhesive bandage non steril" },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 19 G" },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 25 G" },
  { bmhp: "Rapid Test Sifilis", merk: "Nontreponemal syphilis antigen test card/cassette" },
  { bmhp: "Pot Sputum", merk: "Pot Dahak" },
  { bmhp: "Strip Hb", merk: "Hemoglobin test kit" },
  { bmhp: "Rapid Test Sifilis", merk: "Nontreponemal syphilis antibody test card/cassette" },
  { bmhp: "Reagen lyse", merk: "Diff lyse reagent" },
  { bmhp: "Reagen lyse", merk: "Hematology analyzer reagent kit 5 Diff" },
  { bmhp: "Reagen control", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Reagensia HDL Direct", merk: "Lain-lain" },
  { bmhp: "Cartridge TCM", merk: "Mycobacterium tuberculosis IgG/IgM test kit" },
  { bmhp: "Tuberkulin Vial", merk: "Tuberculin Purified Protein Derivative 5 TU/0,1 mL Larutan Injeksi" },
  { bmhp: "Tuberkulin Vial", merk: "Tuberculin Purified Protein Derivative RT23 0,4 mcg/0,1 mL Suspensi Injeksi" },
  { bmhp: "Reagen cleanser", merk: "MTB pre-treatment reagent" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (11 parameters)" },
  { bmhp: "Cartridge TCM", merk: "Mycobacterium tuberculosis PCR test kit" },
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

  // Load all bmhp_materials for these plans: (name_lower, plan_id) → id
  const bmhpRows: any[] = await db
    .selectFrom("bmhp_materials")
    .select(["id", "name", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  const bmhpIdByNameAndPlan = new Map<string, number>()
  const bmhpMatIds: number[] = []
  for (const r of bmhpRows) {
    const key = `${(r.name as string).toLowerCase().trim()}__${r.program_plan_id}`
    bmhpIdByNameAndPlan.set(key, Number(r.id))
    bmhpMatIds.push(Number(r.id))
  }

  // Load level-2 materials: name_lower → id
  const materialRows: any[] = await db
    .selectFrom("materials")
    .select(["id", "name"])
    .where("material_level_id", "=", 2)
    .where("deleted_at", "is", null)
    .execute()

  const materialIdByName = new Map<string, number>(
    materialRows.map((r) => [r.name.toLowerCase().trim(), Number(r.id)])
  )

  // Delete existing ws_bmhp_material_details for all affected bmhp_materials
  if (bmhpMatIds.length > 0) {
    for (let i = 0; i < bmhpMatIds.length; i += BATCH) {
      await db
        .deleteFrom("ws_bmhp_material_details")
        .where("bmhp_material_id", "in", bmhpMatIds.slice(i, i + BATCH))
        .execute()
    }
  }

  // Insert 147 pairs × N plans
  const toInsert: Array<{
    bmhp_material_id: number
    material_id: number
    material_level_id: number
    test_qty_per_package: number
  }> = []

  for (const planId of programPlanIds) {
    for (const pair of BMHP_MERK_PAIRS) {
      const bmhpId = bmhpIdByNameAndPlan.get(`${pair.bmhp.toLowerCase().trim()}__${planId}`)
      const matId = materialIdByName.get(pair.merk.toLowerCase().trim())
      if (!bmhpId || !matId) continue
      toInsert.push({
        bmhp_material_id: bmhpId,
        material_id: matId,
        material_level_id: 2,
        test_qty_per_package: 0,
      })
    }
  }

  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += BATCH) {
      await db
        .insertInto("ws_bmhp_material_details")
        .values(toInsert.slice(i, i + BATCH))
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const programPlanIds = await fetchBMHPPlanIds(db)
  if (programPlanIds.length === 0) return

  const bmhpRows: any[] = await db
    .selectFrom("bmhp_materials")
    .select("id")
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  const bmhpMatIds = bmhpRows.map((r) => Number(r.id))

  if (bmhpMatIds.length > 0) {
    for (let i = 0; i < bmhpMatIds.length; i += BATCH) {
      await db
        .deleteFrom("ws_bmhp_material_details")
        .where("bmhp_material_id", "in", bmhpMatIds.slice(i, i + BATCH))
        .execute()
    }
  }
}
