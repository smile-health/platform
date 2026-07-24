import type { Kysely } from "kysely"

const MONTH_DIST = "1,2,3,4,5,6,7,8,9,10,11,12"

type MtcTemplate = {
  /** Unique key dalam batch ini untuk resolusi parent_id */
  key: string
  /** Key dari parent row (null = root dose) */
  parentKey: string | null
  /** Category dari ws_mp_program_config yang menjadi parent */
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
}

/**
 * 34 baris MTC dari CSV Result_8_updated.csv
 * Dose chain di-encode via parentKey → key
 * Catatan: Td tg=6 & HPV tg=6 parent-nya di-resolve lewat query runtime (ref_id=130)
 */
const MTC_DATA: MtcTemplate[] = [
  // ── Non-bias: tg=1 (BBL) ────────────────────────────────────────────────
  { key: "6071_1_0",    parentKey: null,          pcCategory: "non_bias", material_id: 6071, target_group_id: 1, category: "non_bias", type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 0,    end_ideal_days: 7,    restricted_ideal_day: 8,    material_target_ref_id: 30 },
  { key: "6027_1_30",   parentKey: null,          pcCategory: "non_bias", material_id: 6027, target_group_id: 1, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 30,   end_ideal_days: 359,  restricted_ideal_day: 360,  material_target_ref_id: 31 },
  { key: "6088_1_0",    parentKey: null,          pcCategory: "non_bias", material_id: 6088, target_group_id: 1, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 0,    end_ideal_days: 7,    restricted_ideal_day: null, material_target_ref_id: null },

  // ── Non-bias: DPT-HB-Hib tg=2 (SI) — 3 dosis primer (DPT1, DPT2, DPT3) ─
  { key: "6067_2_60",   parentKey: null,          pcCategory: "non_bias", material_id: 6067, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.7, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 60,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 36 },
  { key: "6067_2_90",   parentKey: "6067_2_60",   pcCategory: "non_bias", material_id: 6067, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.7, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 90,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 37 },
  { key: "6067_2_120",  parentKey: "6067_2_90",   pcCategory: "non_bias", material_id: 6067, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.7, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 120, end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 38 },

  // ── Non-bias: DPT-HB-Hib tg=3 (Baduta) — 1 dosis booster (DPT Booster) ─
  { key: "6067_3_540",  parentKey: "6067_2_120",          pcCategory: "non_bias", material_id: 6067, target_group_id: 3, category: "non_bias", type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 540, end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 39 },

  // ── Non-bias: Polio tg=2 (SI, 4 dosis) ─────────────────────────────────
  { key: "6049_2_30",   parentKey: null,          pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 30,   end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 32 },
  { key: "6049_2_60",   parentKey: "6049_2_30",   pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 60,   end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 33 },
  { key: "6049_2_90",   parentKey: "6049_2_60",   pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 90,   end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 34 },
  { key: "6049_2_120",  parentKey: "6049_2_90",   pcCategory: "non_bias", material_id: 6049, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.8, number_of_dose: 4, month_distribution: MONTH_DIST, start_ideal_days: 120,  end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 35 },

  // ── Non-bias: Rotavirus tg=2 (SI) ───────────────────────────────────────
  { key: "6076_2_60",   parentKey: null,          pcCategory: "non_bias", material_id: 6076, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 60,   end_ideal_days: 209,  restricted_ideal_day: 210, material_target_ref_id: null },
  { key: "6076_2_90",   parentKey: "6076_2_60",          pcCategory: "non_bias", material_id: 6076, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 90,   end_ideal_days: 209,  restricted_ideal_day: 210, material_target_ref_id: null },
  { key: "6076_2_120",   parentKey: "6076_2_60",          pcCategory: "non_bias", material_id: 6076, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.9, number_of_dose: 3, month_distribution: MONTH_DIST, start_ideal_days: 120,   end_ideal_days: 209,  restricted_ideal_day: 210, material_target_ref_id: null },

  // ── Non-bias: PCV tg=2 (SI) — 2 dosis primer (PCV1, PCV2) ─────────────
  { key: "6083_2_60",   parentKey: null,          pcCategory: "non_bias", material_id: 6083, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 2,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 60,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 43 },
  { key: "6083_2_90",   parentKey: "6083_2_60",   pcCategory: "non_bias", material_id: 6083, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 2,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 90,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 44 },

  // ── Non-bias: PCV tg=3 (Baduta) — 1 dosis booster (PCV Booster) ────────
  { key: "6083_3_360",  parentKey: "6083_2_90",          pcCategory: "non_bias", material_id: 6083, target_group_id: 3, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 360, end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 45 },

  // ── Non-bias: MR tg=2 (SI) — 1 dosis (MR1) ─────────────────────────────
  { key: "6040_2_270",  parentKey: null,          pcCategory: "non_bias", material_id: 6040, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 2,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 270, end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 48 },

  // ── Non-bias: MR tg=3 (Baduta) — 1 dosis booster (MR2) ─────────────────
  { key: "6040_3_540",  parentKey: "6040_2_270",          pcCategory: "non_bias", material_id: 6040, target_group_id: 3, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 540, end_ideal_days: 1799, restricted_ideal_day: null, material_target_ref_id: 49 },

  // ── Non-bias: IPV tg=2 (SI, 2 dosis) ───────────────────────────────────
  { key: "6075_2_120",  parentKey: null,          pcCategory: "non_bias", material_id: 6075, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 120,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 46 },
  { key: "6075_2_270",  parentKey: "6075_2_120",  pcCategory: "non_bias", material_id: 6075, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 2, month_distribution: MONTH_DIST, start_ideal_days: 270,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 47 },

  // ── Non-bias: JE tg=2 (SI) ──────────────────────────────────────────────
  { key: "6035_2_300",  parentKey: null,          pcCategory: "non_bias", material_id: 6035, target_group_id: 2, category: "non_bias", type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 300,  end_ideal_days: 1799, restricted_ideal_day: 1800, material_target_ref_id: 50 },

  // ── Non-bias: Td tg=9 (WUS) ──────────────────────────────────────────────
  { key: "6064_9_5475", parentKey: null,          pcCategory: "non_bias", material_id: 6064, target_group_id: 9, category: "non_bias", type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: MONTH_DIST, start_ideal_days: 5475, end_ideal_days: 14594, restricted_ideal_day: null, material_target_ref_id: null },

  // ── Bias: MR tg=4 (Kelas 1 SD) ─────────────────────────────────────────
  { key: "6040_4_2555", parentKey: null,          pcCategory: "bias",     material_id: 6040, target_group_id: 4, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: 8, start_ideal_days: 2555, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 51 },

  // ── Bias: DT tg=4 (Kelas 1 SD) ─────────────────────────────────────────
  { key: "6093_4_2555", parentKey: null,          pcCategory: "bias",     material_id: 6093, target_group_id: 4, category: "bias",     type: "immunization", injection_month: null, ip: 1,   number_of_dose: 1, month_distribution: 11, start_ideal_days: 2555, end_ideal_days: null, restricted_ideal_day: 2920, material_target_ref_id: 52 },

  // ── Bias: Td tg=5 (Kelas 2 SD) ─────────────────────────────────────────
  { key: "6064_5_2920", parentKey: null,          pcCategory: "bias",     material_id: 6064, target_group_id: 5, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: 11, start_ideal_days: 2920, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 53 },

  // ── Bias: Td tg=6 (Kelas 5 SD perempuan) — parent di-resolve via ref_id=130
  { key: "6064_6_4015", parentKey: "6064_5_2920",          pcCategory: "bias",     material_id: 6064, target_group_id: 6, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: 11, start_ideal_days: 4015, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 54 },

  // ── Bias: HPV tg=6 (Kelas 5 SD perempuan) — parent di-resolve via ref_id=130
  { key: "6072_6_4015", parentKey: null,          pcCategory: "bias",     material_id: 6072, target_group_id: 6, category: "bias",     type: "immunization", injection_month: null, ip: 0.6, number_of_dose: 1, month_distribution: 8, start_ideal_days: 4015, end_ideal_days: null, restricted_ideal_day: 4380, material_target_ref_id: 54 },
]

export async function up(db: Kysely<any>): Promise<void> {
  const configs = await db
    .selectFrom("ws_mp_program_config")
    .select(["id", "category"])
    .where("year", "=", 2027)
    .where("program_id", "=", 1)
    .where("deleted_at", "is", null)
    .execute()

  const pcIdMap = new Map<string, number>(
    configs.map((c) => [c.category as string, Number(c.id)])
  )

  if (pcIdMap.size === 0) {
    throw new Error(
      "ws_mp_program_config untuk year=2027 tidak ditemukan. Jalankan migration 1772151000008 terlebih dahulu."
    )
  }

  type InsertedRow = {
    tmpl: MtcTemplate
    insertedId: number
  }
  const inserted: InsertedRow[] = []

  for (const tmpl of MTC_DATA) {
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
      })
      .executeTakeFirst()

    if (result?.insertId) {
      inserted.push({ tmpl, insertedId: Number(result.insertId) })
    }
  }

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

  const biasConfigId = pcIdMap.get("bias")
  if (biasConfigId) {
    const refParent = await db
      .selectFrom("ws_mp_material_target_config")
      .select("id")
      .where("mp_program_config_id", "=", biasConfigId)
      .where("material_target_ref_id", "=", 130)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (refParent) {
      await db
        .updateTable("ws_mp_material_target_config")
        .set({ parent_id: Number(refParent.id) })
        .where("mp_program_config_id", "=", biasConfigId)
        .where("material_target_ref_id", "=", 54)
        .where("parent_id", "is", null)
        .where("deleted_at", "is", null)
        .execute()
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

  await db
    .deleteFrom("ws_mp_material_target_config")
    .where("mp_program_config_id", "in", configIds)
    .execute()
}
