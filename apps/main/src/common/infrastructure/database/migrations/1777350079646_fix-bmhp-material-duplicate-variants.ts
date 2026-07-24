import type { Kysely } from "kysely"
import { sql } from "kysely"

/**
 * Fix two issues with BMHP material variant data:
 *
 * 1. Merge "Alc" (PKG-NMD-031, materials.id=9894) into "Alcohol Swab" (PKG-NMD-030).
 *    "Alc" is a typo — it is the same merk as "Alcohol Swab". Its single brand variant
 *    (PKG-NMD-V-0051) is moved under the Alcohol Swab merk groups, then all Alc traces
 *    are soft-deleted.
 *
 * 2. Remap ws_bmhp_material_variant_detail.material_id for 1106 duplicate PKG-NMD-V-*
 *    materials that share names with pre-existing materials in the materials table.
 *    Migration 1773187200007 inserted these duplicates; this migration remaps the
 *    variant details to the canonical (older) material ids so stock lookups work.
 */

const ALC_MATERIAL_ID = 9894

// [alc_variant_id, alcohol_swab_variant_id] per program plan
const ALC_VARIANT_PAIRS: Array<[number, number]> = [
  [4244, 4243], // plan 131
  [4363, 4362], // plan 137
  [4482, 4481], // plan 138
  [4601, 4600], // plan 139
  [4720, 4719], // plan 140
  [4839, 4838], // plan 141
  [4958, 4957], // plan 147
  [5077, 5076], // plan 148
  [5196, 5195], // plan 150
]

export async function up(db: Kysely<any>): Promise<void> {
  // ── Step 0: Merge Alc (PKG-NMD-031) into Alcohol Swab (PKG-NMD-030) ──────────

  // 0a. Move variant detail rows from Alc variant IDs to Alcohol Swab variant IDs
  for (const [alcVariantId, alcoholSwabVariantId] of ALC_VARIANT_PAIRS) {
    await db
      .updateTable("ws_bmhp_material_variant_detail")
      .set({ material_variant_id: alcoholSwabVariantId })
      .where("material_variant_id", "=", alcVariantId)
      .where("deleted_at", "is", null)
      .execute()
  }

  // 0b. Soft-delete Alc ws_bmhp_material_variant rows
  await db
    .updateTable("ws_bmhp_material_variant")
    .set({ deleted_at: new Date() })
    .where("material_id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is", null)
    .execute()

  // 0c. Soft-delete ws_bmhp_material_details linked to Alc (via material_workspaces id)
  await sql`
    UPDATE ws_bmhp_material_details wbd
    JOIN material_workspaces mw ON mw.id = wbd.material_id
    SET wbd.deleted_at = NOW()
    WHERE mw.material_id = ${ALC_MATERIAL_ID}
      AND wbd.deleted_at IS NULL
  `.execute(db)

  // 0d. Soft-delete material_relations for Alc
  await db
    .updateTable("material_relations")
    .set({ deleted_at: new Date() })
    .where("child_material_id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is", null)
    .execute()

  // 0e. Soft-delete material_workspaces for Alc
  await db
    .updateTable("material_workspaces")
    .set({ deleted_at: new Date() })
    .where("material_id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is", null)
    .execute()

  // 0f. Soft-delete materials for Alc
  await db
    .updateTable("materials")
    .set({ deleted_at: new Date() })
    .where("id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is", null)
    .execute()

  console.log("Step 0: Alc merged into Alcohol Swab")

  // ── Steps 1-6: Fix PKG-NMD-V-* duplicate materials ───────────────────────────

  // Step 1: Build duplicate mapping (new PKG-NMD-V-* id → canonical old id)
  // Picks the old entry with the most stock; tie-breaks by smallest id (oldest entry).
  // Skips the 88 genuinely new PKG-NMD-V-* materials (no matching name in old records).
  const duplicateRows = await sql<{ new_id: number; old_id: number }>`
    SELECT
      new_m.id AS new_id,
      (
        SELECT old_m2.id
        FROM materials old_m2
        LEFT JOIN ws_materials wm2 ON wm2.global_id = old_m2.id AND wm2.deleted_at IS NULL
        LEFT JOIN ws_stocks s2 ON s2.material_id = wm2.id AND s2.deleted_at IS NULL
        WHERE old_m2.name = new_m.name
          AND old_m2.code NOT LIKE 'PKG-NMD-V-%'
          AND old_m2.deleted_at IS NULL
        GROUP BY old_m2.id
        ORDER BY COUNT(s2.id) DESC, old_m2.id ASC
        LIMIT 1
      ) AS old_id
    FROM materials new_m
    WHERE new_m.code LIKE 'PKG-NMD-V-%'
      AND new_m.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM materials old_m
        WHERE old_m.name = new_m.name
          AND old_m.code NOT LIKE 'PKG-NMD-V-%'
          AND old_m.deleted_at IS NULL
      )
  `.execute(db)

  const duplicates = duplicateRows.rows.filter((r) => r.old_id != null)
  console.log(`Step 1: Found ${duplicates.length} duplicate PKG-NMD-V-* materials`)

  // Step 2: Remap ws_bmhp_material_variant_detail.material_id (batches of 50)
  for (let i = 0; i < duplicates.length; i += 50) {
    const batch = duplicates.slice(i, i + 50)
    for (const { new_id, old_id } of batch) {
      await db
        .updateTable("ws_bmhp_material_variant_detail")
        .set({ material_id: old_id })
        .where("material_id", "=", new_id)
        .where("deleted_at", "is", null)
        .execute()
    }
  }

  console.log("Step 2: Remapped variant detail material_ids")

  const newIds = duplicates.map((d) => d.new_id)

  // Steps 3-6: Soft-delete in batches of 100
  for (let i = 0; i < newIds.length; i += 100) {
    const batch = newIds.slice(i, i + 100)

    // Step 3: Soft-delete material_relations
    await db
      .updateTable("material_relations")
      .set({ deleted_at: new Date() })
      .where("child_material_id", "in", batch)
      .where("deleted_at", "is", null)
      .execute()

    // Step 4: Soft-delete material_workspaces
    await db
      .updateTable("material_workspaces")
      .set({ deleted_at: new Date() })
      .where("material_id", "in", batch)
      .where("deleted_at", "is", null)
      .execute()

    // Step 5: Soft-delete materials
    await db
      .updateTable("materials")
      .set({ deleted_at: new Date() })
      .where("id", "in", batch)
      .where("deleted_at", "is", null)
      .execute()
  }

  console.log(`Steps 3-5: Soft-deleted ${newIds.length} duplicate PKG-NMD-V-* material records`)
}

export async function down(db: Kysely<any>): Promise<void> {
  // ── Reverse Steps 3-6: Undelete PKG-NMD-V-* duplicates ──────────────────────

  await db
    .updateTable("materials")
    .set({ deleted_at: null })
    .where("code", "like", "PKG-NMD-V-%")
    .where("deleted_at", "is not", null)
    .execute()

  await sql`
    UPDATE material_workspaces mw
    JOIN materials m ON m.id = mw.material_id
    SET mw.deleted_at = NULL
    WHERE m.code LIKE 'PKG-NMD-V-%'
      AND mw.deleted_at IS NOT NULL
  `.execute(db)

  await sql`
    UPDATE material_relations mr
    JOIN materials m ON m.id = mr.child_material_id
    SET mr.deleted_at = NULL
    WHERE m.code LIKE 'PKG-NMD-V-%'
      AND mr.deleted_at IS NOT NULL
  `.execute(db)

  // Reverse Step 2: Restore mvd.material_id back to PKG-NMD-V-* ids via name match.
  // Only touches rows where a unique PKG-NMD-V-* material with the same name exists.
  await sql`
    UPDATE ws_bmhp_material_variant_detail wbmvd
    JOIN materials old_m ON old_m.id = wbmvd.material_id
      AND old_m.code NOT LIKE 'PKG-NMD-V-%'
    JOIN materials pkg_m ON pkg_m.name = old_m.name
      AND pkg_m.code LIKE 'PKG-NMD-V-%'
      AND pkg_m.deleted_at IS NULL
    SET wbmvd.material_id = pkg_m.id
    WHERE wbmvd.deleted_at IS NULL
      AND (
        SELECT COUNT(*) FROM materials cx
        WHERE cx.name = old_m.name
          AND cx.code LIKE 'PKG-NMD-V-%'
          AND cx.deleted_at IS NULL
      ) = 1
  `.execute(db)

  // ── Reverse Step 0: Restore Alc (PKG-NMD-031) ────────────────────────────────

  // D0a. Move mvd rows back from Alcohol Swab variant IDs to Alc variant IDs
  for (const [alcVariantId, alcoholSwabVariantId] of ALC_VARIANT_PAIRS) {
    await db
      .updateTable("ws_bmhp_material_variant_detail")
      .set({ material_variant_id: alcVariantId })
      .where("material_variant_id", "=", alcoholSwabVariantId)
      .where("deleted_at", "is", null)
      .execute()
  }

  // D0b. Undelete ws_bmhp_material_variant for Alc
  await db
    .updateTable("ws_bmhp_material_variant")
    .set({ deleted_at: null })
    .where("material_id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is not", null)
    .execute()

  // D0c. Undelete ws_bmhp_material_details for Alc
  await sql`
    UPDATE ws_bmhp_material_details wbd
    JOIN material_workspaces mw ON mw.id = wbd.material_id
    SET wbd.deleted_at = NULL
    WHERE mw.material_id = ${ALC_MATERIAL_ID}
      AND wbd.deleted_at IS NOT NULL
  `.execute(db)

  // D0d. Undelete material_relations for Alc
  await db
    .updateTable("material_relations")
    .set({ deleted_at: null })
    .where("child_material_id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is not", null)
    .execute()

  // D0e. Undelete material_workspaces for Alc
  await db
    .updateTable("material_workspaces")
    .set({ deleted_at: null })
    .where("material_id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is not", null)
    .execute()

  // D0f. Undelete materials for Alc
  await db
    .updateTable("materials")
    .set({ deleted_at: null })
    .where("id", "=", ALC_MATERIAL_ID)
    .where("deleted_at", "is not", null)
    .execute()

  console.log("down(): Alc and PKG-NMD-V-* duplicates restored")
}
