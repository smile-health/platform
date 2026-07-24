/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from "kysely"

const CATEGORY_MAP: Array<{ category: "non_bias" | "bias"; tgIds: number[] }> = [
  { category: "non_bias", tgIds: [1, 2, 3, 9] },
  { category: "bias", tgIds: [4, 5, 7, 10] },
]

/** Ambil prefix pertama dari nama material (split by non-alphanumeric, lowercase).
 *  Contoh: "BCG @20 ds (SII)" → "bcg", "DPT-HB-Hib" → "dpt", "ADS 3 ml" → "ads"
 */
function getNamePrefix(name: string): string {
  return (name.split(/[^a-zA-Z0-9]/)[0] ?? "").toLowerCase()
}

export async function up(db: Kysely<any>): Promise<void> {
  for (const { category, tgIds } of CATEGORY_MAP) {
    // ── 1. Load timing dari ws_material_targets ──────────────────────────────
    const wmtRows = await db
      .selectFrom("ws_material_targets as wmt")
      .innerJoin("ws_materials as m", "m.id", "wmt.material_id")
      .select([
        "wmt.id",
        "wmt.material_id",
        "wmt.injection_month",
        "wmt.start_ideal_days",
        "wmt.end_ideal_days",
        "wmt.restricted_ideal_day",
        "wmt.parent_id",
        "m.name as material_name",
      ])
      .where("wmt.type", "=", "immunization")
      .where("wmt.category", "=", category)
      .where("wmt.deleted_at", "is", null)
      .orderBy("wmt.id", "asc")
      .execute()

    // Build lookup: exact material_id → [wmt rows]
    const wmtById = new Map<number, typeof wmtRows>()
    // Build lookup: name prefix → [wmt rows]
    const wmtByPrefix = new Map<string, typeof wmtRows>()

    for (const wmt of wmtRows) {
      const id = Number(wmt.material_id)
      wmtById.set(id, [...(wmtById.get(id) ?? []), wmt])

      const prefix = getNamePrefix(wmt.material_name)
      wmtByPrefix.set(prefix, [...(wmtByPrefix.get(prefix) ?? []), wmt])
    }

    // ── 2. Load plan tasks untuk category ini ────────────────────────────────
    const planRows = await db
      .selectFrom("ws_plan_tasks as pt")
      .innerJoin("ws_mp_program_config as pc", (join) =>
        join
          .onRef("pc.seeded_from_plan_id", "=", "pt.program_plan_id")
          .on("pc.category", "=", category)
          .on("pc.deleted_at", "is", null)
      )
      .innerJoin("ws_materials as m", "m.id", "pt.material_id")
      .select([
        "pt.material_id",
        "pt.target_group_id",
        "pt.ip",
        "pt.number_of_dose",
        "pt.month_distribution",
        "pc.id as mp_program_config_id",
        "m.name as material_name",
      ])
      .where("pt.deleted_at", "is", null)
      .where("pt.target_group_id", "in", tgIds)
      .execute()

    // ── 3. Expand: setiap plan row × matched wmt rows ─────────────────────────
    // wmt null → tidak ada timing match, tetap di-insert dengan nilai null
    type WmtRow = (typeof wmtRows)[number]
    type PlanRow = (typeof planRows)[number]
    type InsertRow = { planRow: PlanRow; wmt: WmtRow | null; insertedId?: number }

    const insertRows: InsertRow[] = []

    for (const planRow of planRows) {
      const exactMatches = wmtById.get(Number(planRow.material_id))
      if (exactMatches?.length) {
        // Exact match by material_id
        for (const wmt of exactMatches) insertRows.push({ planRow, wmt })
      } else {
        // Fallback: match by nama prefix (similar name)
        const prefix = getNamePrefix(planRow.material_name)
        const prefixMatches = wmtByPrefix.get(prefix)
        if (prefixMatches?.length) {
          for (const wmt of prefixMatches) insertRows.push({ planRow, wmt })
        } else {
          // Tidak ada match → insert dengan timing null
          insertRows.push({ planRow, wmt: null })
        }
      }
    }

    // ── 4. Pass 1: INSERT semua rows dengan parent_id = null ──────────────────
    for (const row of insertRows) {
      const { planRow, wmt } = row
      const result = await db
        .insertInto("ws_mp_material_target_config")
        .values({
          mp_program_config_id: planRow.mp_program_config_id,
          material_id: planRow.material_id,
          target_group_id: planRow.target_group_id,
          category,
          type: "immunization",
          injection_month: wmt?.injection_month ?? null,
          ip: planRow.ip,
          number_of_dose: planRow.number_of_dose,
          month_distribution: planRow.month_distribution ?? null,
          start_ideal_days: wmt?.start_ideal_days ?? null,
          end_ideal_days: wmt?.end_ideal_days ?? null,
          restricted_ideal_day: wmt?.restricted_ideal_day ?? null,
          parent_id: null,
          material_target_ref_id: wmt ? Number(wmt.id) : null,
        })
        .executeTakeFirst()

      if (result?.insertId) {
        row.insertedId = Number(result.insertId)
      }
    }

    // ── 5. Pass 2: UPDATE parent_id ───────────────────────────────────────────
    // Cari parent row dengan planRow yang sama (reference identity) + wmt.id == parent_id
    // Ini memastikan parent chain per (plan_task, dose) tetap konsisten
    for (const row of insertRows) {
      if (!row.wmt?.parent_id || !row.insertedId) continue

      const parentRow = insertRows.find(
        (r) => r.planRow === row.planRow && Number(r.wmt?.id) === Number(row.wmt!.parent_id)
      )
      if (!parentRow?.insertedId) continue

      await db
        .updateTable("ws_mp_material_target_config")
        .set({ parent_id: parentRow.insertedId })
        .where("id", "=", row.insertedId)
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("ws_mp_material_target_config").execute()
}
