import { type Kysely } from "kysely"

const ALL_PROVINCES = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21,
  31, 32, 33, 34, 35, 36,
  51, 52, 53,
  61, 62, 63, 64, 65,
  71, 72, 73, 74, 75, 76,
  81, 82,
  91, 92, 93, 94, 95, 96,
]
const HEKSAVALEN_PROVINCES = [34, 51, 52, 91, 92, 93, 94, 95, 96]
const NON_HEKSAVALEN_PROVINCES = ALL_PROVINCES.filter((p) => !HEKSAVALEN_PROVINCES.includes(p))
const PAPUA_PROVINCES = [91, 92, 93, 94, 95, 96]

/**
 * Material-to-correct-provinces map untuk year >= 2026.
 * Key: material_id, Value: { provinces, onlyPrimerDose? }
 *   onlyPrimerDose = true → hanya berlaku untuk start_ideal_days < 365
 */
const FIXES: Array<{
  material_id: number
  provinces: number[]
  onlyPrimerDose?: boolean
}> = [
  { material_id: 4052, provinces: HEKSAVALEN_PROVINCES },           // Heksavalen
  { material_id: 3977, provinces: NON_HEKSAVALEN_PROVINCES },       // Hep B
  { material_id: 3979, provinces: NON_HEKSAVALEN_PROVINCES },       // IPV
  { material_id: 3980, provinces: PAPUA_PROVINCES },                // JE
  { material_id: 3974, provinces: NON_HEKSAVALEN_PROVINCES, onlyPrimerDose: true }, // DPT-HB-Hib primer
]

const FIX_YEAR = 2026

export async function up(db: Kysely<any>): Promise<void> {
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select(["id", "year"])
    .where("year", ">=", FIX_YEAR)
    .where("program_id", "=", 1)
    .where("deleted_at", "is", null)
    .execute()

  if (configs.length === 0) return

  const configIds = configs.map((c) => Number(c.id))

  for (const fix of FIXES) {
    const mtcs = await db
      .selectFrom("ws_mp_material_target_config")
      .select(["id", "start_ideal_days"])
      .where("mp_program_config_id", "in", configIds)
      .where("material_id", "=", fix.material_id)
      .where("deleted_at", "is", null)
      .execute()

    const targetMtcs = fix.onlyPrimerDose
      ? mtcs.filter((m) => (m.start_ideal_days ?? 0) < 365)
      : mtcs

    if (targetMtcs.length === 0) continue

    const mtcIds = targetMtcs.map((m) => Number(m.id))
    const correctProvinceSet = new Set(fix.provinces)
    const wrongProvinces = ALL_PROVINCES.filter((p) => !correctProvinceSet.has(p))

    // Remove coverage for provinces that should NOT have this material
    if (wrongProvinces.length > 0) {
      await db
        .deleteFrom("ws_mp_province_coverage")
        .where("mp_material_target_config_id", "in", mtcIds)
        .where("province_id", "in", wrongProvinces)
        .execute()
    }

    // Insert missing correct province coverage
    for (const mtcId of mtcIds) {
      const existing = await db
        .selectFrom("ws_mp_province_coverage")
        .select("province_id")
        .where("mp_material_target_config_id", "=", mtcId)
        .execute()

      const existingSet = new Set(existing.map((r) => Number(r.province_id)))
      const missing = fix.provinces.filter((p) => !existingSet.has(p))

      if (missing.length > 0) {
        await db
          .insertInto("ws_mp_province_coverage")
          .values(
            missing.map((provinceId) => ({
              mp_material_target_config_id: mtcId,
              province_id: provinceId,
              coverage_number: 100,
            }))
          )
          .execute()
      }
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Re-add removed provinces and remove added ones (restore to all-38 state)
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select("id")
    .where("year", ">=", FIX_YEAR)
    .where("program_id", "=", 1)
    .where("deleted_at", "is", null)
    .execute()

  if (configs.length === 0) return

  const configIds = configs.map((c) => Number(c.id))

  for (const fix of FIXES) {
    const mtcs = await db
      .selectFrom("ws_mp_material_target_config")
      .select(["id", "start_ideal_days"])
      .where("mp_program_config_id", "in", configIds)
      .where("material_id", "=", fix.material_id)
      .where("deleted_at", "is", null)
      .execute()

    const targetMtcs = fix.onlyPrimerDose
      ? mtcs.filter((m) => (m.start_ideal_days ?? 0) < 365)
      : mtcs

    if (targetMtcs.length === 0) continue

    const mtcIds = targetMtcs.map((m) => Number(m.id))
    const correctProvinceSet = new Set(fix.provinces)
    const removedProvinces = ALL_PROVINCES.filter((p) => !correctProvinceSet.has(p))

    for (const mtcId of mtcIds) {
      const existing = await db
        .selectFrom("ws_mp_province_coverage")
        .select("province_id")
        .where("mp_material_target_config_id", "=", mtcId)
        .execute()

      const existingSet = new Set(existing.map((r) => Number(r.province_id)))
      const missing = removedProvinces.filter((p) => !existingSet.has(p))

      if (missing.length > 0) {
        await db
          .insertInto("ws_mp_province_coverage")
          .values(
            missing.map((provinceId) => ({
              mp_material_target_config_id: mtcId,
              province_id: provinceId,
              coverage_number: 100,
            }))
          )
          .execute()
      }
    }
  }
}
