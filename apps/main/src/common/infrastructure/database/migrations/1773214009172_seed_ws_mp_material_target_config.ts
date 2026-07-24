import { sql, Kysely } from "kysely"
import { Database } from "../types/index.js"

const MONTH_DIST = "1,2,3,4,5,6,7,8,9,10,11,12"

type MtcTemplate = {
  key: string
  parentKey: string | null
  pcCategory: "non_bias" | "bias"
  material_id: number
  target_group_id: number
  category: "non_bias" | "bias"
  type: "immunization"
  injection_month: string | null
  ip: number
  number_of_dose: number
  month_distribution: string
  start_ideal_days: number | null
  end_ideal_days: number | null
  restricted_ideal_day: number | null
  material_target_ref_id: number | null
  material_key: string | null
  minYear?: number
}

const MTC_DATA: MtcTemplate[] = [
  // ── Non-bias: HepB tg=1 (BBL) ────────────────────────────────────────────
  { key: "6071_1_0",    parentKey: null,          pcCategory: "non_bias", material_id: 6071, target_group_id: 1, category: "non_bias", type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 0,    end_ideal_days: 7,    restricted_ideal_day: 8,    material_target_ref_id: 30, material_key: "hb0" },

  // ── Non-bias: BCG tg=1 (BBL) ─────────────────────────────────────────────
  { key: "6027_1_30",   parentKey: null,          pcCategory: "non_bias", material_id: 6027, target_group_id: 1, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 30,   end_ideal_days: 359,  restricted_ideal_day: 360,  material_target_ref_id: 31, material_key: "bcg" },

  // ── Non-bias: Heksavalen tg=1 (BBL) ──────────────────────────────────────
  { key: "6088_1_0",    parentKey: null,          pcCategory: "non_bias", material_id: 6088, target_group_id: 1, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 0,    end_ideal_days: 7,    restricted_ideal_day: null, material_target_ref_id: null, material_key: "heksavalen", minYear: 2026 },

  // ── Non-bias: DPT-HB-Hib tg=2 (SI) — 3 dosis primer ─────────────────────
  { key: "6067_2_60",   parentKey: null,          pcCategory: "non_bias", material_id: 6067, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.7, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 60,   end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 36, material_key: "dpt_hb_hib" },
  { key: "6067_2_90",   parentKey: "6067_2_60",   pcCategory: "non_bias", material_id: 6067, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.7, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 90,   end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 37, material_key: "dpt_hb_hib" },
  { key: "6067_2_120",  parentKey: "6067_2_90",   pcCategory: "non_bias", material_id: 6067, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.7, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 120,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 38, material_key: null },

  // ── Non-bias: DPT-HB-Hib tg=3 (Baduta) — 1 dosis booster ────────────────
  { key: "6067_3_540",  parentKey: "6067_2_120",  pcCategory: "non_bias", material_id: 6067, target_group_id: 3, category: "non_bias", type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 540,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 39, material_key: null },

  // ── Non-bias: Polio tg=2 (SI, 4 dosis) ───────────────────────────────────
  { key: "6049_2_30",   parentKey: null,          pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 30,   end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 32, material_key: "polio" },
  { key: "6049_2_60",   parentKey: "6049_2_30",   pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 60,   end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 33, material_key: "polio" },
  { key: "6049_2_90",   parentKey: "6049_2_60",   pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 90,   end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 34, material_key: null },
  { key: "6049_2_120",  parentKey: "6049_2_90",   pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 120,  end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 35, material_key: null },

  // ── Non-bias: Rotavirus tg=2 (SI) ────────────────────────────────────────
  { key: "6076_2_60",   parentKey: null,          pcCategory: "non_bias", material_id: 6076, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 60,   end_ideal_days: 209,  restricted_ideal_day: 210, material_target_ref_id: null, material_key: "rotavirus" },
  { key: "6076_2_90",   parentKey: "6076_2_60",   pcCategory: "non_bias", material_id: 6076, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 90,   end_ideal_days: 209,  restricted_ideal_day: 210, material_target_ref_id: null, material_key: "rotavirus" },
  { key: "6076_2_120",  parentKey: "6076_2_90",   pcCategory: "non_bias", material_id: 6076, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 120,  end_ideal_days: 209,  restricted_ideal_day: 210, material_target_ref_id: null, material_key: null },

  // ── Non-bias: PCV tg=2 (SI) — 2 dosis primer ─────────────────────────────
  { key: "6083_2_60",   parentKey: null,          pcCategory: "non_bias", material_id: 6083, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 2,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 60,   end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 43, material_key: "pcv" },
  { key: "6083_2_90",   parentKey: "6083_2_60",   pcCategory: "non_bias", material_id: 6083, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 2,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 90,   end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 44, material_key: "pcv" },

  // ── Non-bias: PCV tg=3 (Baduta) — 1 dosis booster ────────────────────────
  { key: "6083_3_360",  parentKey: "6083_2_90",   pcCategory: "non_bias", material_id: 6083, target_group_id: 3, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 360,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 45, material_key: null },

  // ── Non-bias: MR tg=2 (SI) — 1 dosis (MR1) ──────────────────────────────
  { key: "6040_2_270",  parentKey: null,          pcCategory: "non_bias", material_id: 6040, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 2,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 270,  end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 48, material_key: "mr" },

  // ── Non-bias: MR tg=3 (Baduta) — 1 dosis booster (MR2) ──────────────────
  { key: "6040_3_540",  parentKey: "6040_2_270",  pcCategory: "non_bias", material_id: 6040, target_group_id: 3, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 540,  end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 49, material_key: "mr" },

  // ── Non-bias: IPV tg=2 (SI, 2 dosis) ─────────────────────────────────────
  { key: "6075_2_120",  parentKey: null,          pcCategory: "non_bias", material_id: 6075, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 120,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 46, material_key: "ipv" },
  { key: "6075_2_270",  parentKey: "6075_2_120",  pcCategory: "non_bias", material_id: 6075, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 270,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 47, material_key: "ipv" },

  // ── Non-bias: JE tg=2 (SI) ───────────────────────────────────────────────
  { key: "6035_2_300",  parentKey: null,          pcCategory: "non_bias", material_id: 6035, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 300,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 50, material_key: null },

  // ── Non-bias: Td tg=9 (WUS) ──────────────────────────────────────────────
  { key: "6064_9_5475", parentKey: null,          pcCategory: "non_bias", material_id: 6064, target_group_id: 9, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 5475, end_ideal_days: 14594, restricted_ideal_day: null, material_target_ref_id: null, material_key: "td" },

  // ── Bias: MR tg=4 (Kelas 1 SD) ──────────────────────────────────────────
  { key: "6040_4_2555", parentKey: null,          pcCategory: "bias",     material_id: 6040, target_group_id: 4, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: "8", start_ideal_days: 2555, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 51, material_key: "mr" },

  // ── Bias: DT tg=4 (Kelas 1 SD) ──────────────────────────────────────────
  { key: "6093_4_2555", parentKey: null,          pcCategory: "bias",     material_id: 6093, target_group_id: 4, category: "bias",     type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: "11", start_ideal_days: 2555, end_ideal_days: null, restricted_ideal_day: 2920, material_target_ref_id: 52, material_key: "dt" },

  // ── Bias: Td tg=5 (Kelas 2 SD) ──────────────────────────────────────────
  { key: "6064_5_2920", parentKey: null,          pcCategory: "bias",     material_id: 6064, target_group_id: 5, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: "11", start_ideal_days: 2920, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 53, material_key: "td" },

  // ── Bias: Td tg=6 (Kelas 5 SD perempuan) ─────────────────────────────────
  { key: "6064_6_4015", parentKey: "6064_5_2920", pcCategory: "bias",     material_id: 6064, target_group_id: 6, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: "11", start_ideal_days: 4015, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 54, material_key: "td" },

  // ── Bias: HPV tg=6 (Kelas 5 SD perempuan) ────────────────────────────────
  { key: "6072_6_4015", parentKey: null,          pcCategory: "bias",     material_id: 6072, target_group_id: 6, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: "8", start_ideal_days: 4015, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 54, material_key: "hpv" },
]

const CURRENT_YEAR = 2027
const START_YEAR = CURRENT_YEAR - 17

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`SET FOREIGN_KEY_CHECKS = 0`.execute(db)
  await sql`TRUNCATE TABLE ws_mp_province_coverage`.execute(db)
  await sql`TRUNCATE TABLE ws_mp_material_target_config`.execute(db)
  await sql`TRUNCATE TABLE ws_mp_program_config`.execute(db)
  await sql`SET FOREIGN_KEY_CHECKS = 1`.execute(db)

  for (let year = START_YEAR; year <= CURRENT_YEAR; year++) {
    // ── Insert ws_mp_program_config for each year ─────────────────────────
    for (const category of ["non_bias", "bias"] as const) {
      await db
        .insertInto("ws_mp_program_config")
        .values({
          year,
          program_id: 1,
          category,
          status: 1,
          seeded_from_plan_id: null,
          seeded_at: new Date(),
        })
        .ignore()
        .execute()
    }

    // ── Get program config IDs for this year ──────────────────────────────
    const configs = await db
      .selectFrom("ws_mp_program_config")
      .select(["id", "category"])
      .where("year", "=", year)
      .where("program_id", "=", 1)
      .where("deleted_at", "is", null)
      .execute()

    const pcIdMap = new Map<string, number>(
      configs.map((c) => [c.category as string, Number(c.id)])
    )

    if (pcIdMap.size === 0) continue

    // ── Pass 1: INSERT all rows with parent_id = null ─────────────────────
    type InsertedRow = { tmpl: MtcTemplate; insertedId: number }
    const inserted: InsertedRow[] = []

    for (const tmpl of MTC_DATA) {
      if (tmpl.minYear && year < tmpl.minYear) continue

      const pcId = pcIdMap.get(tmpl.pcCategory)
      if (!pcId) continue

      const existing = await db
        .selectFrom("ws_mp_material_target_config")
        .select("id")
        .where("mp_program_config_id", "=", pcId)
        .where("material_id", "=", tmpl.material_id)
        .where("target_group_id", "=", tmpl.target_group_id)
        .where("start_ideal_days", "=", tmpl.start_ideal_days)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      if (existing) {
        // Update material_key if needed
        if (tmpl.material_key) {
          await db
            .updateTable("ws_mp_material_target_config")
            .set({ material_key: tmpl.material_key })
            .where("id", "=", Number(existing.id))
            .execute()
        }
        inserted.push({ tmpl, insertedId: Number(existing.id) })
        continue
      }

      const result = await db
        .insertInto("ws_mp_material_target_config")
        .values({
          mp_program_config_id: pcId,
          material_id: tmpl.material_id,
          target_group_id: tmpl.target_group_id,
          category: tmpl.category,
          type: tmpl.type,
          injection_month: tmpl.injection_month,
          ip: tmpl.ip,
          number_of_dose: tmpl.number_of_dose,
          month_distribution: tmpl.month_distribution,
          start_ideal_days: tmpl.start_ideal_days,
          end_ideal_days: tmpl.end_ideal_days,
          restricted_ideal_day: tmpl.restricted_ideal_day,
          parent_id: null,
          material_target_ref_id: tmpl.material_target_ref_id,
          material_key: tmpl.material_key,
        })
        .executeTakeFirst()

      if (result?.insertId) {
        inserted.push({ tmpl, insertedId: Number(result.insertId) })
      }
    }

    // ── Pass 2: UPDATE parent_id for dose chains ──────────────────────────
    for (const row of inserted) {
      if (!row.tmpl.parentKey) continue

      const parentRow = inserted.find((r) => r.tmpl.key === row.tmpl.parentKey)
      if (!parentRow) continue

      await db
        .updateTable("ws_mp_material_target_config")
        .set({ parent_id: parentRow.insertedId })
        .where("id", "=", row.insertedId)
        .execute()
    }
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select("id")
    .where("year", ">=", START_YEAR)
    .where("year", "<", CURRENT_YEAR)
    .where("program_id", "=", 1)
    .execute()

  const configIds = configs.map((c) => Number(c.id))
  if (configIds.length === 0) return

  await db
    .deleteFrom("ws_mp_material_target_config")
    .where("mp_program_config_id", "in", configIds)
    .execute()
}
