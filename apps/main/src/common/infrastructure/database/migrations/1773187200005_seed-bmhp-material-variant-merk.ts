import type { Kysely } from "kysely"

/**
 * Seed ws_bmhp_material_variant dari Master_Data_Product_Variant.xlsx
 * 1 row per Merk (level 2 material) per program_plan BMHP year >= 2026.
 * Jika material level 2 belum ada di DB, insert terlebih dahulu.
 */

const ALL_MERKS: Array<{ name: string; code: string }> = [
  { name: 'Dental varnish', code: 'PKG-NMD-001' },
  { name: 'Medical adhesive tape', code: 'PKG-NMD-002' },
  { name: 'Hemoglobin test strip', code: 'PKG-NMD-003' },
  { name: 'Patient Examination Glove L Nitrile Powder Free Non Steril', code: 'PKG-NMD-004' },
  { name: 'Patient Examination Glove M Latex Powder free Non Steril', code: 'PKG-NMD-005' },
  { name: 'Patient Examination Glove M Latex Powdered/Pre Powdered Non Steril', code: 'PKG-NMD-006' },
  { name: 'Blood cell diluents', code: 'PKG-NMD-007' },
  { name: 'Vacuum Blood Collection Tube K3 EDTA PET 3 mL', code: 'PKG-NMD-008' },
  { name: 'Vacuum Blood Collection Tube K2 EDTA PET 2 mL', code: 'PKG-NMD-009' },
  { name: 'Vacuum Blood Collection Tube K2 EDTA PET 3 mL', code: 'PKG-NMD-010' },
  { name: 'Vacuum Blood Collection Tube Plain PET 3 mL', code: 'PKG-NMD-011' },
  { name: 'Lancet Stainless', code: 'PKG-NMD-012' },
  { name: 'Micropippette Tips', code: 'PKG-NMD-013' },
  { name: 'HBsAg Test Card', code: 'PKG-NMD-014' },
  { name: 'Patient Examination Glove M Nitrile Powder Free Non Steril', code: 'PKG-NMD-015' },
  { name: 'Glucose Test Strip', code: 'PKG-NMD-016' },
  { name: 'Disposable lancet 28G', code: 'PKG-NMD-017' },
  { name: 'Treponema pallidum treponemal antibody test card/cassette', code: 'PKG-NMD-018' },
  { name: 'Cholesterol (total) test kit', code: 'PKG-NMD-019' },
  { name: 'Creatine test reagen kit', code: 'PKG-NMD-020' },
  { name: 'High density lipoprotein (HDL) test kit', code: 'PKG-NMD-021' },
  { name: 'AST/SGOT test kit', code: 'PKG-NMD-022' },
  { name: 'Triglyceride test kit', code: 'PKG-NMD-023' },
  { name: 'Urea nitrogen test reagen kit', code: 'PKG-NMD-024' },
  { name: 'HIV test card/ cassette', code: 'PKG-NMD-025' },
  { name: 'HBsAg Test Strip', code: 'PKG-NMD-026' },
  { name: 'HCV Test Card/Cassette', code: 'PKG-NMD-027' },
  { name: 'Collection swab & virus sampling tube', code: 'PKG-NMD-028' },
  { name: 'Dye and Chemical Solution Stains Ziehl Neelsen Solution', code: 'PKG-NMD-029' },
  { name: 'Alcohol Swab', code: 'PKG-NMD-030' },
  { name: 'Alc', code: 'PKG-NMD-031' },
  { name: 'Malaria Test Card/Cassette', code: 'PKG-NMD-032' },
  { name: 'Lipoprotein test reagent kit', code: 'PKG-NMD-033' },
  { name: 'HCV Reagent Test Strip', code: 'PKG-NMD-034' },
  { name: 'Specimen container sterile 60 mL', code: 'PKG-NMD-035' },
  { name: 'Vacuum Blood Collection Tube Clot Activator PET 3 mL', code: 'PKG-NMD-036' },
  { name: 'Vacuum Blood Collection Tube Clot Activator PET 2 mL', code: 'PKG-NMD-037' },
  { name: 'Vacuum Blood Collection Tube Gel and Clot Activator PET 2 mL', code: 'PKG-NMD-038' },
  { name: 'Vacuum Blood Collection Tube Gel and Clot Activator PET 3 mL', code: 'PKG-NMD-039' },
  { name: 'Vacuum Blood Collection Tube K3 EDTA PET 2 mL', code: 'PKG-NMD-040' },
  { name: 'Viral transport medium (VTM)', code: 'PKG-NMD-041' },
  { name: 'Patient examination glove L latex powder free non steril', code: 'PKG-NMD-042' },
  { name: 'Patient Examination Glove S Latex Powder free Non Steril', code: 'PKG-NMD-043' },
  { name: 'Bahan Pemeriksaan Malaria', code: 'PKG-NMD-044' },
  { name: 'Ultrasound gel', code: 'PKG-NMD-045' },
  { name: 'Plaque Disclosing Solution', code: 'PKG-NMD-046' },
  { name: 'Dental varnish with flouride liquid', code: 'PKG-NMD-047' },
  { name: 'Blood collection safety holder disposable', code: 'PKG-NMD-048' },
  { name: 'Wing needle blood collection set', code: 'PKG-NMD-049' },
  { name: 'Cholesterol (total) test reagent', code: 'PKG-NMD-050' },
  { name: 'Clinical chemistry calibrator liquid', code: 'PKG-NMD-051' },
  { name: 'Multiple Autoantibodies Test', code: 'PKG-NMD-052' },
  { name: 'Urine test strip (14 parameters)', code: 'PKG-NMD-053' },
  { name: 'Red cell lysing reagent', code: 'PKG-NMD-054' },
  { name: 'ECG Paper', code: 'PKG-NMD-055' },
  { name: 'Medical absorbent cotton (kapas pembalut) 250 gr', code: 'PKG-NMD-056' },
  { name: 'Vaginal Self Collection and Transport Swab', code: 'PKG-NMD-057' },
  { name: 'Medical absorbent cotton (kapas pembalut) 100 gr', code: 'PKG-NMD-058' },
  { name: 'Medical absorbent cotton (kapas pembalut) 500 gr', code: 'PKG-NMD-059' },
  { name: 'Patient Examination Glove L Latex Powdered/Pre Powdered Non Steril', code: 'PKG-NMD-060' },
  { name: 'Patient Examination Glove S Latex Powdered/Pre Powdered Non Steril', code: 'PKG-NMD-061' },
  { name: 'Creatinine test kit', code: 'PKG-NMD-062' },
  { name: 'High density lipoprotein (HDL) test reagent', code: 'PKG-NMD-063' },
  { name: 'Urea nitrogen test reagent', code: 'PKG-NMD-064' },
  { name: 'Lain-lain', code: 'PKG-NMD-065' },
  { name: 'HIV & Syphilis Rapid Test', code: 'PKG-NMD-066' },
  { name: 'Dental restorative set', code: 'PKG-NMD-067' },
  { name: 'Dental surgical set', code: 'PKG-NMD-068' },
  { name: 'Specimen transport and storage container non steril', code: 'PKG-NMD-069' },
  { name: 'Lyse reagent', code: 'PKG-NMD-070' },
  { name: 'Adhesive bandage steril', code: 'PKG-NMD-071' },
  { name: 'Specimen transport and storage container steril', code: 'PKG-NMD-072' },
  { name: 'Occult blood test Cassette', code: 'PKG-NMD-073' },
  { name: 'Stick swab (cotton/ flock)', code: 'PKG-NMD-074' },
  { name: 'MTB and resistance RIF & INH (MDR TB) molecular tests', code: 'PKG-NMD-075' },
  { name: 'Urine test strip (10 parameters)', code: 'PKG-NMD-076' },
  { name: 'Urine test strip (3 parameters)', code: 'PKG-NMD-077' },
  { name: 'Hematology Analyzer Reagent Kit 5 Diff', code: 'PKG-NMD-078' },
  { name: 'Medical absorbent cotton stick', code: 'PKG-NMD-079' },
  { name: 'General purpose solution for in vitro diagnostik', code: 'PKG-NMD-080' },
  { name: 'Cleaning solution', code: 'PKG-NMD-081' },
  { name: 'Hematology Quality Control Mixture', code: 'PKG-NMD-082' },
  { name: 'Dental varnish with flouride gel', code: 'PKG-NMD-083' },
  { name: 'Immersion Oil', code: 'PKG-NMD-084' },
  { name: 'Scalp Vein Set 27 G', code: 'PKG-NMD-085' },
  { name: 'Cotton Applicators Wood Tidak Steril', code: 'PKG-NMD-086' },
  { name: 'Cotton Applicators Wood Steril', code: 'PKG-NMD-087' },
  { name: 'Low density lipoprotein (LDL) test kit', code: 'PKG-NMD-088' },
  { name: 'Triglyceride test reagent', code: 'PKG-NMD-089' },
  { name: 'Micro brush for fluoride varnish', code: 'PKG-NMD-090' },
  { name: 'Cleanser/ wash solution for instrument', code: 'PKG-NMD-091' },
  { name: 'Hematology Analyzer Reagent Kit 3 Diff', code: 'PKG-NMD-092' },
  { name: 'Patient Examination Glove XS Latex Powdered/Pre Powdered Non Steril', code: 'PKG-NMD-093' },
  { name: 'Patient examination glove XL latex powdered/pre powdered non steril', code: 'PKG-NMD-094' },
  { name: 'Scalp Vein Set 23 G', code: 'PKG-NMD-095' },
  { name: 'Disposable lancet 26G', code: 'PKG-NMD-096' },
  { name: 'Electrode gel', code: 'PKG-NMD-097' },
  { name: 'Dental bib disposable', code: 'PKG-NMD-098' },
  { name: 'Patient examination glove L latex powder free steril', code: 'PKG-NMD-099' },
  { name: 'Patient Examination Glove M Latex Powder free Steril', code: 'PKG-NMD-100' },
  { name: 'Patient examination glove S latex powder free steril', code: 'PKG-NMD-101' },
  { name: 'Patient Examination Glove L Nitrile Powder Free Steril', code: 'PKG-NMD-102' },
  { name: 'Patient examination glove M nitrile powder free steril', code: 'PKG-NMD-103' },
  { name: 'Patient examination glove S nitrile powder free steril', code: 'PKG-NMD-104' },
  { name: 'Non Woven Adhesive', code: 'PKG-NMD-105' },
  { name: 'Adhesive bandage non steril', code: 'PKG-NMD-106' },
  { name: 'Scalp Vein Set 19 G', code: 'PKG-NMD-107' },
  { name: 'Scalp Vein Set 25 G', code: 'PKG-NMD-108' },
  { name: 'Nontreponemal syphilis antigen test card/cassette', code: 'PKG-NMD-109' },
  { name: 'Pot Dahak', code: 'PKG-NMD-110' },
  { name: 'Hemoglobin test kit', code: 'PKG-NMD-111' },
  { name: 'Nontreponemal syphilis antibody test card/cassette', code: 'PKG-NMD-112' },
  { name: 'Diff lyse reagent', code: 'PKG-NMD-113' },
  { name: 'Hematology analyzer reagent kit 5 Diff', code: 'PKG-NMD-114' },
  { name: 'Mycobacterium tuberculosis IgG/IgM test kit', code: 'PKG-NMD-115' },
  { name: 'Tuberculin Purified Protein Derivative 5 TU/0,1 mL Larutan Injeksi', code: 'PKG-NMD-116' },
  { name: 'Tuberculin Purified Protein Derivative RT23 0,4 mcg/0,1 mL Suspensi Injeksi', code: 'PKG-NMD-117' },
  { name: 'MTB pre-treatment reagent', code: 'PKG-NMD-118' },
  { name: 'Urine test strip (11 parameters)', code: 'PKG-NMD-119' },
  { name: 'Mycobacterium tuberculosis PCR test kit', code: 'PKG-NMD-120' },
]

export async function up(db: Kysely<any>): Promise<void> {
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

  // Lookup materials yang sudah di-seed oleh migration 004
  const materialRows: any[] = await db
    .selectFrom("materials")
    .select(["id", "name"])
    .where("material_level_id", "=", 2)
    .where("deleted_at", "is", null)
    .execute()
  const materialIdByName = new Map<string, number>(
    materialRows.map((r) => [r.name.toLowerCase().trim(), Number(r.id)])
  )

  // Cek existing by (material_id, program_plan_id) untuk idempotent
  const existingVariants: any[] = await db
    .selectFrom("ws_bmhp_material_variant")
    .select(["material_id", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const existingSet = new Set(
    existingVariants.map((r: any) => `${r.material_id}__${r.program_plan_id}`)
  )

  const toInsert: Array<{ material_id: number; is_variant: number; program_plan_id: number }> = []
  for (const planId of programPlanIds) {
    for (const m of ALL_MERKS) {
      const materialId = materialIdByName.get(m.name.toLowerCase().trim())
      if (!materialId) continue
      if (existingSet.has(`${materialId}__${planId}`)) continue
      toInsert.push({ material_id: materialId, is_variant: 1, program_plan_id: planId })
    }
  }

  if (toInsert.length > 0) {
    const BATCH = 50
    for (let i = 0; i < toInsert.length; i += BATCH) {
      await db.insertInto("ws_bmhp_material_variant").values(toInsert.slice(i, i + BATCH)).execute()
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

  const materialRows: any[] = await db
    .selectFrom("materials")
    .select(["id", "name"])
    .where("material_level_id", "=", 2)
    .where("deleted_at", "is", null)
    .execute()
  const materialIdByName = new Map<string, number>(
    materialRows.map((r) => [r.name.toLowerCase().trim(), Number(r.id)])
  )

  const materialIds = ALL_MERKS
    .map((m) => materialIdByName.get(m.name.toLowerCase().trim()))
    .filter((id): id is number => id !== undefined)

  if (materialIds.length > 0) {
    await db
      .deleteFrom("ws_bmhp_material_variant")
      .where("material_id", "in", materialIds)
      .where("program_plan_id", "in", programPlanIds)
      .execute()
  }
}
