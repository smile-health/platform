import type { Kysely } from "kysely"

/**
 * Seed materials level 2 (Merk) dari Master_Data_Product_Variant.xlsx ke PKG workspace (id=9)
 * Total: 120 Merk names. Kondisi: hanya insert jika belum ada di materials level 2 (by name, case-insensitive).
 * Code format: PKG-NMD-001 s/d PKG-NMD-120 (hanya untuk yang baru diinsert)
 *
 * Defaults: material_type_id=3 (non_medical_devices), unit_of_consumption_id=1 (pcs),
 * unit_of_distribution_id=6 (box), consumption_unit_per_distribution_unit=1,
 * is_temperature_sensitive=0, min/max_retail_price=0, is_managed_in_batch=1, status=1
 */

const ALL_MERKS = [
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
  // Lookup unit IDs by name dari material_units
  const unitRows: any[] = await db
    .selectFrom("material_units")
    .select(["id", "name"])
    .where("name", "in", ["pcs", "box"])
    .execute()
  const unitIdByName = new Map<string, number>(unitRows.map((r: any) => [r.name.toLowerCase(), Number(r.id)]))
  const unitOfConsumptionId = unitIdByName.get("pcs")
  const unitOfDistributionId = unitIdByName.get("box")
  if (!unitOfConsumptionId || !unitOfDistributionId) throw new Error("Unit 'pcs' atau 'box' tidak ditemukan di material_units")

  // Fetch semua materials level 2 yang sudah ada (by name lowercase)
  const existingRows: any[] = await db
    .selectFrom("materials")
    .select("name")
    .where("material_level_id", "=", 2)
    .where("deleted_at", "is", null)
    .execute()
  const existingNames = new Set(existingRows.map((r: any) => r.name.toLowerCase().trim()))

  // Filter: hanya insert jika belum ada by name
  const toInsert = ALL_MERKS.filter((m) => !existingNames.has(m.name.toLowerCase().trim()))

  for (const m of toInsert) {
    const result = await db
      .insertInto("materials")
      .values({
        name: m.name,
        code: m.code,
        material_level_id: 2,
        material_type_id: 4,
        unit_of_consumption_id: unitOfConsumptionId,
        unit_of_distribution_id: unitOfDistributionId,
        consumption_unit_per_distribution_unit: 1,
        is_temperature_sensitive: 0,
        min_retail_price: 0,
        max_retail_price: 0,
        is_managed_in_batch: 1,
        status: 1,
        created_by: 1,
        updated_by: 1,
        is_kfa: 1,
        is_stock_opname_mandatory: 0,
      })
      .executeTakeFirst()

    const materialId = Number(result.insertId)

    await db
      .insertInto("material_workspaces")
      .values({
        material_id: materialId,
        workspace_id: 39,
        status: 1,
      })
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const codes = ALL_MERKS.map((m) => m.code)

  const rows: any[] = await db
    .selectFrom("materials")
    .select("id")
    .where("code", "in", codes)
    .execute()
  const ids = rows.map((r: any) => Number(r.id))

  if (ids.length === 0) return

  await db.deleteFrom("material_workspaces").where("material_id", "in", ids).execute()
  await db.deleteFrom("materials").where("id", "in", ids).execute()
}
