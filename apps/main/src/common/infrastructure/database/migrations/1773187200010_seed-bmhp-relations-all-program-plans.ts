import type { Kysely } from "kysely"

/**
 * Propagate relasi data ke semua program_plan BMHP year >= 2026.
 *
 * Masalah: migration 008 (ws_bmhp_material_details) dan 007 (ws_bmhp_material_variant_detail)
 * hanya ter-seed untuk satu program_plan (148), sedangkan program_plan lain (131,137,138,139,140,141,147)
 * masih kosong atau partial.
 *
 * Strategi: gunakan data yang sudah ada di plan 148 sebagai referensi,
 * lalu copy ke semua plan lain yang belum punya data.
 *
 * Tabel yang di-populate:
 * 1. ws_bmhp_material_details  — bridge bmhp_materials → materials (lv2)
 * 2. ws_bmhp_material_variant_detail — bridge ws_bmhp_material_variant → materials (lv3)
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Fetch semua program_plan BMHP year >= 2026
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

  // ─── 1. ws_bmhp_material_details ───────────────────────────────────────────

  // Ambil semua bmhp_materials dikelompokkan per (name → Map<program_plan_id, id>)
  const bmhpMaterials: any[] = await db
    .selectFrom("bmhp_materials")
    .select(["id", "name", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  // name.toLowerCase() → { program_plan_id → bmhp_material_id }
  const bmhpByNameAndPlan = new Map<string, Map<number, number>>()
  for (const bm of bmhpMaterials) {
    const key = bm.name.toLowerCase().trim()
    if (!bmhpByNameAndPlan.has(key)) bmhpByNameAndPlan.set(key, new Map())
    bmhpByNameAndPlan.get(key)!.set(Number(bm.program_plan_id), Number(bm.id))
  }

  // Ambil semua ws_bmhp_material_details yang sudah ada (untuk idempotent)
  const existingDetails: any[] = await db
    .selectFrom("ws_bmhp_material_details")
    .select(["bmhp_material_id", "material_id"])
    .where("deleted_at", "is", null)
    .execute()
  const existingDetailKeys = new Set(
    existingDetails.map((r: any) => `${r.bmhp_material_id}|${r.material_id}`)
  )

  // Gunakan plan 148 sebagai referensi: cari semua (bmhp_name, material_id, material_level_id, test_qty)
  // dari detail yang sudah ada untuk plan 148
  const refDetails: any[] = await db
    .selectFrom("ws_bmhp_material_details as d")
    .innerJoin("bmhp_materials as bm", "bm.id", "d.bmhp_material_id")
    .select([
      "bm.name as bmhp_name",
      "d.material_id",
      "d.material_level_id",
      "d.test_qty_per_package",
    ])
    .where("bm.program_plan_id", "in", programPlanIds)
    .where("d.deleted_at", "is", null)
    .where("bm.deleted_at", "is", null)
    .execute()

  // Group referensi per bmhp_name
  const refByBmhpName = new Map<string, Array<{ material_id: number; material_level_id: number; test_qty_per_package: number }>>()
  for (const r of refDetails) {
    const key = r.bmhp_name.toLowerCase().trim()
    if (!refByBmhpName.has(key)) refByBmhpName.set(key, [])
    refByBmhpName.get(key)!.push({
      material_id: Number(r.material_id),
      material_level_id: Number(r.material_level_id),
      test_qty_per_package: Number(r.test_qty_per_package),
    })
  }

  const detailsToInsert: Array<{
    bmhp_material_id: number
    material_id: number
    material_level_id: number
    test_qty_per_package: number
  }> = []

  for (const [bmhpName, planMap] of bmhpByNameAndPlan) {
    const refMaterials = refByBmhpName.get(bmhpName)
    if (!refMaterials || refMaterials.length === 0) continue

    for (const [planId, bmhpMaterialId] of planMap) {
      for (const ref of refMaterials) {
        const key = `${bmhpMaterialId}|${ref.material_id}`
        if (existingDetailKeys.has(key)) continue
        detailsToInsert.push({
          bmhp_material_id: bmhpMaterialId,
          material_id: ref.material_id,
          material_level_id: ref.material_level_id,
          test_qty_per_package: ref.test_qty_per_package,
        })
        existingDetailKeys.add(key) // prevent dupe in batch
      }
    }
  }

  if (detailsToInsert.length > 0) {
    const BATCH = 50
    for (let i = 0; i < detailsToInsert.length; i += BATCH) {
      await db
        .insertInto("ws_bmhp_material_details")
        .values(detailsToInsert.slice(i, i + BATCH))
        .execute()
    }
  }

  // ─── 2. ws_bmhp_material_variant_detail ────────────────────────────────────

  // Ambil semua ws_bmhp_material_variant (material_id lv2, program_plan_id → variant.id)
  const variants: any[] = await db
    .selectFrom("ws_bmhp_material_variant")
    .select(["id", "material_id", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  // material_id (lv2) → program_plan_id → variant.id
  const variantByMaterialAndPlan = new Map<number, Map<number, number>>()
  for (const v of variants) {
    const matId = Number(v.material_id)
    const planId = Number(v.program_plan_id)
    if (!variantByMaterialAndPlan.has(matId)) variantByMaterialAndPlan.set(matId, new Map())
    variantByMaterialAndPlan.get(matId)!.set(planId, Number(v.id))
  }

  // Ambil referensi ws_bmhp_material_variant_detail yang sudah ada (semua plan)
  const existingVarDetails: any[] = await db
    .selectFrom("ws_bmhp_material_variant_detail")
    .select(["material_variant_id", "material_id"])
    .where("deleted_at", "is", null)
    .execute()
  const existingVarDetailKeys = new Set(
    existingVarDetails.map((r: any) => `${r.material_variant_id}|${r.material_id}`)
  )

  // Gunakan semua variant_detail yang sudah ada sebagai referensi template
  // Group by material_id (lv2, via variant) → list of (material_id lv3, name, test_qty, unit_id)
  const refVarDetails: any[] = await db
    .selectFrom("ws_bmhp_material_variant_detail as vd")
    .innerJoin("ws_bmhp_material_variant as v", "v.id", "vd.material_variant_id")
    .select([
      "v.material_id as lv2_material_id",
      "vd.material_id as lv3_material_id",
      "vd.name",
      "vd.test_qty",
      "vd.unit_id",
    ])
    .where("v.program_plan_id", "in", programPlanIds)
    .where("vd.deleted_at", "is", null)
    .where("v.deleted_at", "is", null)
    .execute()

  // Group by lv2_material_id → ref items
  const refVarByLv2 = new Map<number, Array<{ lv3_material_id: number; name: string; test_qty: number | null; unit_id: number | null }>>()
  for (const r of refVarDetails) {
    const key = Number(r.lv2_material_id)
    if (!refVarByLv2.has(key)) refVarByLv2.set(key, [])
    refVarByLv2.get(key)!.push({
      lv3_material_id: Number(r.lv3_material_id),
      name: r.name,
      test_qty: r.test_qty != null ? Number(r.test_qty) : null,
      unit_id: r.unit_id != null ? Number(r.unit_id) : null,
    })
  }

  const varDetailsToInsert: Array<{
    material_variant_id: number
    material_id: number
    name: string
    test_qty: number | null
    unit_id: number | null
  }> = []

  for (const [lv2MaterialId, planVariantMap] of variantByMaterialAndPlan) {
    const refItems = refVarByLv2.get(lv2MaterialId)
    if (!refItems || refItems.length === 0) continue

    for (const [, variantId] of planVariantMap) {
      for (const ref of refItems) {
        const key = `${variantId}|${ref.lv3_material_id}`
        if (existingVarDetailKeys.has(key)) continue
        varDetailsToInsert.push({
          material_variant_id: variantId,
          material_id: ref.lv3_material_id,
          name: ref.name,
          test_qty: ref.test_qty,
          unit_id: ref.unit_id,
        })
        existingVarDetailKeys.add(key) // prevent dupe in batch
      }
    }
  }

  if (varDetailsToInsert.length > 0) {
    const BATCH = 50
    for (let i = 0; i < varDetailsToInsert.length; i += BATCH) {
      await db
        .insertInto("ws_bmhp_material_variant_detail")
        .values(varDetailsToInsert.slice(i, i + BATCH))
        .execute()
    }
  }

  // Set is_variant = 1 untuk semua variant yang memiliki detail di DB (bukan hanya yang baru diinsert)
  const variantIdsInDB: any[] = await db
    .selectFrom("ws_bmhp_material_variant_detail")
    .select("material_variant_id")
    .where("deleted_at", "is", null)
    .groupBy("material_variant_id")
    .execute()

  const variantIdsWithDetails = variantIdsInDB.map((r: any) => Number(r.material_variant_id))
  if (variantIdsWithDetails.length > 0) {
    const BATCH = 50
    for (let i = 0; i < variantIdsWithDetails.length; i += BATCH) {
      await db
        .updateTable("ws_bmhp_material_variant")
        .set({ is_variant: 0 })
        .where("id", "in", variantIdsWithDetails.slice(i, i + BATCH))
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  /**
   * down() menghapus SEMUA rows dari ws_bmhp_material_details dan
   * ws_bmhp_material_variant_detail untuk semua BMHP program plans.
   *
   * Tidak ada ID yang di-hardcode agar bisa berjalan di env manapun.
   * Setelah down(), jalankan ulang migration 007 dan 008 untuk restore data referensi.
   */
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

  // Hapus SEMUA ws_bmhp_material_details untuk semua BMHP program plans
  const allBmhpIds: any[] = await db
    .selectFrom("bmhp_materials")
    .select("id")
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  if (allBmhpIds.length > 0) {
    const ids = allBmhpIds.map((r: any) => Number(r.id))
    const BATCH = 50
    for (let i = 0; i < ids.length; i += BATCH) {
      await db
        .deleteFrom("ws_bmhp_material_details")
        .where("bmhp_material_id", "in", ids.slice(i, i + BATCH))
        .execute()
    }
  }

  // Hapus SEMUA ws_bmhp_material_variant_detail untuk semua BMHP program plans
  const allVariantIds: any[] = await db
    .selectFrom("ws_bmhp_material_variant")
    .select("id")
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  if (allVariantIds.length > 0) {
    const ids = allVariantIds.map((r: any) => Number(r.id))
    const BATCH = 50
    for (let i = 0; i < ids.length; i += BATCH) {
      await db
        .deleteFrom("ws_bmhp_material_variant_detail")
        .where("material_variant_id", "in", ids.slice(i, i + BATCH))
        .execute()
    }
  }
}
