import type { Kysely } from "kysely"

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
 * Provinsi 32 = Jawa Barat, 34 = DI Yogyakarta, 51 = Bali
 */
const HEKSAVALEN_PROVINCES = [32, 34, 51]
const NON_HEKSAVALEN_PROVINCES = ALL_PROVINCES.filter(
  (p) => !HEKSAVALEN_PROVINCES.includes(p)
)

/**
 * Map material_id → daftar provinsi yang berhak menerima coverage.
 * Material yang TIDAK terdaftar di sini → semua 38 provinsi (ALL_PROVINCES).
 *
 * - 6088 (Heksavalen)  → hanya provinsi Heksavalen (32, 34, 51)
 * - 6071 (Hep B)       → semua provinsi kecuali Heksavalen
 * - 6067 (DPT-HB-Hib)  → semua provinsi kecuali Heksavalen
 * - 6075 (IPV)         → semua provinsi kecuali Heksavalen
 * - 6035 (JE)          → hanya provinsi Papua (91, 92, 93, 94, 95, 96)
 */
const MATERIAL_PROVINCE_MAP: Record<number, number[]> = {
  6088: HEKSAVALEN_PROVINCES,
  6071: NON_HEKSAVALEN_PROVINCES,
  6067: NON_HEKSAVALEN_PROVINCES,
  6075: NON_HEKSAVALEN_PROVINCES,
  6035: [91, 92, 93, 94, 95, 96],
}

/**
 * Seed ws_mp_province_coverage untuk semua MTC pada program config 2027.
 *
 * Coverage numbers:
 *   - non_bias → 100
 *   - bias     → 90
 *
 * Province scope per material:
 *   - Heksavalen (6088)  → hanya 32, 34, 51
 *   - Hep B (6071)       → semua kecuali 32, 34, 51
 *   - DPT-HB-Hib (6067)  → semua kecuali 32, 34, 51
 *   - IPV (6075)         → semua kecuali 32, 34, 51
 *   - Lainnya            → semua 38 provinsi
 *
 * Mengambil MTC IDs + material_id secara runtime dari ws_mp_material_target_config.
 */
export async function up(db: Kysely<any>): Promise<void> {
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select(["id", "category"])
    .where("year", "=", 2027)
    .where("program_id", "=", 1)
    .where("deleted_at", "is", null)
    .execute()

  if (configs.length === 0) {
    throw new Error(
      "ws_mp_program_config untuk year=2027 tidak ditemukan. Jalankan migration 1772151000008 terlebih dahulu."
    )
  }

  for (const config of configs) {
    const coverageNumber = config.category === "non_bias" ? 100 : 90

    const mtcs = await db
      .selectFrom("ws_mp_material_target_config")
      .select(["id", "material_id"])
      .where("mp_program_config_id", "=", Number(config.id))
      .where("deleted_at", "is", null)
      .execute()

    if (mtcs.length === 0) continue

    for (const mtc of mtcs) {
      const provinces =
        MATERIAL_PROVINCE_MAP[Number(mtc.material_id)] ?? ALL_PROVINCES

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
    .where("year", "=", 2027)
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
