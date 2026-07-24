import type { Kysely } from "kysely"
import { sql } from "kysely"

/**
 * Merge "Alc" (code=PKG-NMD-031) into "Alcohol Swab" (code=32009324).
 *
 * The previous migration (1777350079646) hardcoded materials.id=9894 for Alc,
 * which does not exist in staging/prod. This migration uses code-based lookup
 * so it works correctly across all environments.
 *
 * Steps:
 *  1. Lookup Alc and Alcohol Swab by their stable material codes
 *  2. Remap ws_bmhp_material_variant_detail rows from Alc variant IDs
 *     to the matching Alcohol Swab variant IDs (matched by program_plan_id)
 *  3. Soft-delete all Alc ws_bmhp_material_variant rows
 *  4. Soft-delete Alc ws_bmhp_material_details, material_relations,
 *     material_workspaces, and materials
 */

const ALC_CODE = "PKG-NMD-031"
const ALCOHOL_SWAB_CODE = "32009324"

export async function up(db: Kysely<any>): Promise<void> {
  const alcMaterial = await db
    .selectFrom("materials")
    .select("id")
    .where("code", "=", ALC_CODE)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!alcMaterial) {
    console.log(`Alc material (${ALC_CODE}) not found or already deleted — skipping`)
    return
  }

  const alcoholSwabMaterial = await db
    .selectFrom("materials")
    .select("id")
    .where("code", "=", ALCOHOL_SWAB_CODE)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!alcoholSwabMaterial) {
    console.log(`Alcohol Swab material (${ALCOHOL_SWAB_CODE}) not found — skipping`)
    return
  }

  const alcId = alcMaterial.id
  const alcoholSwabId = alcoholSwabMaterial.id

  // Step 1: Find Alc/Alcohol Swab variant pairs by program_plan_id
  const variantPairsResult = await sql<{ alc_variant_id: number; asw_variant_id: number }>`
    SELECT alc.id AS alc_variant_id, asw.id AS asw_variant_id
    FROM ws_bmhp_material_variant alc
    JOIN ws_bmhp_material_variant asw
      ON asw.program_plan_id = alc.program_plan_id
      AND asw.material_id = ${alcoholSwabId}
      AND asw.deleted_at IS NULL
    WHERE alc.material_id = ${alcId}
      AND alc.deleted_at IS NULL
  `.execute(db)

  const variantPairs = variantPairsResult.rows
  console.log(`Found ${variantPairs.length} Alc/Alcohol Swab variant pairs`)

  // Step 2: Remap variant_detail rows from Alc variant IDs to Alcohol Swab variant IDs
  for (const { alc_variant_id, asw_variant_id } of variantPairs) {
    await db
      .updateTable("ws_bmhp_material_variant_detail")
      .set({ material_variant_id: asw_variant_id })
      .where("material_variant_id", "=", alc_variant_id)
      .where("deleted_at", "is", null)
      .execute()
  }

  // Step 3: Soft-delete Alc ws_bmhp_material_variant rows
  await db
    .updateTable("ws_bmhp_material_variant")
    .set({ deleted_at: new Date() })
    .where("material_id", "=", alcId)
    .where("deleted_at", "is", null)
    .execute()

  // Step 4: Soft-delete ws_bmhp_material_details linked to Alc
  await sql`
    UPDATE ws_bmhp_material_details wbd
    JOIN material_workspaces mw ON mw.id = wbd.material_id
    SET wbd.deleted_at = NOW()
    WHERE mw.material_id = ${alcId}
      AND wbd.deleted_at IS NULL
  `.execute(db)

  // Step 5: Soft-delete material_relations for Alc
  await db
    .updateTable("material_relations")
    .set({ deleted_at: new Date() })
    .where("child_material_id", "=", alcId)
    .where("deleted_at", "is", null)
    .execute()

  // Step 6: Soft-delete material_workspaces for Alc
  await db
    .updateTable("material_workspaces")
    .set({ deleted_at: new Date() })
    .where("material_id", "=", alcId)
    .where("deleted_at", "is", null)
    .execute()

  // Step 7: Soft-delete materials for Alc
  await db
    .updateTable("materials")
    .set({ deleted_at: new Date() })
    .where("id", "=", alcId)
    .where("deleted_at", "is", null)
    .execute()

  console.log(`Merged Alc (id=${alcId}) into Alcohol Swab (id=${alcoholSwabId})`)
}

export async function down(db: Kysely<any>): Promise<void> {
  // Lookup without deleted_at filter — Alc is soft-deleted after up()
  const alcMaterial = await db
    .selectFrom("materials")
    .select("id")
    .where("code", "=", ALC_CODE)
    .executeTakeFirst()

  if (!alcMaterial) {
    console.log(`Alc material (${ALC_CODE}) not found — nothing to restore`)
    return
  }

  const alcId = alcMaterial.id

  // Restore in reverse order
  await db
    .updateTable("materials")
    .set({ deleted_at: null })
    .where("id", "=", alcId)
    .where("deleted_at", "is not", null)
    .execute()

  await db
    .updateTable("material_workspaces")
    .set({ deleted_at: null })
    .where("material_id", "=", alcId)
    .where("deleted_at", "is not", null)
    .execute()

  await db
    .updateTable("material_relations")
    .set({ deleted_at: null })
    .where("child_material_id", "=", alcId)
    .where("deleted_at", "is not", null)
    .execute()

  await sql`
    UPDATE ws_bmhp_material_details wbd
    JOIN material_workspaces mw ON mw.id = wbd.material_id
    SET wbd.deleted_at = NULL
    WHERE mw.material_id = ${alcId}
      AND wbd.deleted_at IS NOT NULL
  `.execute(db)

  // Restore Alc variants before remapping variant_details
  await db
    .updateTable("ws_bmhp_material_variant")
    .set({ deleted_at: null })
    .where("material_id", "=", alcId)
    .where("deleted_at", "is not", null)
    .execute()

  // Reverse variant_detail remapping: move back from Alcohol Swab variants to Alc variants
  const alcoholSwabMaterial = await db
    .selectFrom("materials")
    .select("id")
    .where("code", "=", ALCOHOL_SWAB_CODE)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (alcoholSwabMaterial) {
    const alcoholSwabId = alcoholSwabMaterial.id

    const variantPairsResult = await sql<{ alc_variant_id: number; asw_variant_id: number }>`
      SELECT alc.id AS alc_variant_id, asw.id AS asw_variant_id
      FROM ws_bmhp_material_variant alc
      JOIN ws_bmhp_material_variant asw
        ON asw.program_plan_id = alc.program_plan_id
        AND asw.material_id = ${alcoholSwabId}
        AND asw.deleted_at IS NULL
      WHERE alc.material_id = ${alcId}
        AND alc.deleted_at IS NULL
    `.execute(db)

    for (const { alc_variant_id, asw_variant_id } of variantPairsResult.rows) {
      await db
        .updateTable("ws_bmhp_material_variant_detail")
        .set({ material_variant_id: alc_variant_id })
        .where("material_variant_id", "=", asw_variant_id)
        .where("deleted_at", "is", null)
        .execute()
    }
  }

  console.log(`Restored Alc (id=${alcId}, code=${ALC_CODE})`)
}
