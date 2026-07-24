import { sql, type Kysely } from "kysely"

/**
 * 38 kode provinsi Indonesia (BPS)
 */
const ALL_PROVINCES = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, // Sumatera
  31, 32, 33, 34, 35, 36,                   // Jawa
  51, 52, 53,                               // Bali & Nusa Tenggara
  61, 62, 63, 64, 65,                       // Kalimantan
  71, 72, 73, 74, 75, 76,                   // Sulawesi
  81, 82,                                   // Maluku
  91, 92, 93, 94, 95, 96,                   // Papua
]

/**
 * Provinsi yang menggunakan Heksavalen (vaksin kombinasi DPT-HB-Hib-IPV).
 * Di provinsi ini TIDAK digunakan Hep B, DPT-HB-Hib, dan IPV secara terpisah.
 * 34 = DI Yogyakarta, 51 = Bali, 52 = NTB, 91-96 = Papua
 */
const HEKSAVALEN_PROVINCES = [34, 51, 52, 91, 92, 93, 94, 95, 96]
const NON_HEKSAVALEN_PROVINCES = ALL_PROVINCES.filter(
  (p) => !HEKSAVALEN_PROVINCES.includes(p)
)

/**
 * Map material_id → daftar provinsi yang berhak menerima coverage (2026 & 2027).
 * Material yang TIDAK terdaftar di sini → semua 38 provinsi (ALL_PROVINCES).
 *
 * - 6088 (Heksavalen)  → hanya provinsi Heksavalen
 * - 6071 (Hep B)       → semua provinsi kecuali Heksavalen
 * - 6075 (IPV)         → semua provinsi kecuali Heksavalen
 * - 6035 (JE)          → hanya provinsi Papua (91, 92, 93, 94, 95, 96)
 * - 6067 (DPT-HB-Hib)  → primer (start_ideal_days < 365): non-Heksavalen only
 *                         booster Baduta (start_ideal_days >= 365): semua provinsi
 */
const MATERIAL_PROVINCE_MAP: Record<number, number[]> = {
  6088: HEKSAVALEN_PROVINCES,
  6071: NON_HEKSAVALEN_PROVINCES,
  6075: NON_HEKSAVALEN_PROVINCES,
  6035: [91, 92, 93, 94, 95, 96],
}

/** Threshold start_ideal_days untuk membedakan dosis Baduta (≥365 hari) dari dosis Bayi */
const BADUTA_START_DAYS_THRESHOLD = 365

const CURRENT_YEAR = 2027
const START_YEAR = CURRENT_YEAR - 17

const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)

export async function up(db: Kysely<any>): Promise<void> {
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select(["id", "year", "category"])
    .where("year", "in", YEARS)
    .where("program_id", "=", 1)
    .where("deleted_at", "is", null)
    .execute()

  for (const config of configs) {
    const coverageNumber = config.category === "non_bias" ? 100 : 90
    const useHeksavalenMap = Number(config.year) >= 2026

    const mtcs = await db
      .selectFrom("ws_mp_material_target_config")
      .select(["id", "material_id", "start_ideal_days"])
      .where("mp_program_config_id", "=", Number(config.id))
      .where("deleted_at", "is", null)
      .execute()

    if (mtcs.length === 0) continue

    for (const mtc of mtcs) {
      let provinces: number[]
      if (useHeksavalenMap) {
        const matId = Number(mtc.material_id)
        if (matId === 6067 && (mtc.start_ideal_days ?? 0) < BADUTA_START_DAYS_THRESHOLD) {
          // DPT-HB-Hib primer (dosis 1-3): provinsi Heksavalen tidak dapat
          provinces = NON_HEKSAVALEN_PROVINCES
        } else {
          // DPT-HB-Hib booster Baduta (>= 365 hari) dan material lain: ikut map atau ALL
          provinces = MATERIAL_PROVINCE_MAP[matId] ?? ALL_PROVINCES
        }
      } else {
        provinces = ALL_PROVINCES
      }

      for (const provinceId of provinces) {
        await db
          .insertInto("ws_mp_province_coverage")
          .values({
            mp_material_target_config_id: Number(mtc.id),
            province_id: provinceId,
            coverage_number: coverageNumber,
          })
          .ignore()
          .execute()
      }
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select("id")
    .where("year", "in", YEARS)
    .where("program_id", "=", 1)
    .execute()

  const configIds = configs.map((c) => Number(c.id))
  if (configIds.length === 0) return

  const mtcs = await db
    .selectFrom("ws_mp_material_target_config")
    .select("id")
    .where("mp_program_config_id", "in", configIds)
    .execute()

  const mtcIds = mtcs.map((m) => Number(m.id))
  if (mtcIds.length === 0) return

  await db
    .deleteFrom("ws_mp_province_coverage")
    .where("mp_material_target_config_id", "in", mtcIds)
    .execute()
}
