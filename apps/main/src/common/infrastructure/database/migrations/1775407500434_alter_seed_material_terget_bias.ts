import { sql, type Kysely } from "kysely"
import { Database } from "../types/index.js"

const TABLE_NAME = "ws_material_targets"

export async function up(db: Kysely<Database>): Promise<void> {
  const data_target_bias_primary = [3570, 3560, 3584, 3563] // mr, dt, td, hpv

  const data_target_bias_additional = [3535, 3533, 3579, 3580]

  const existing = await db.selectFrom(TABLE_NAME).select(["id"]).execute()

  const existingMaterialIds = new Set(existing.map((entry) => entry.id))

  const insertsBiasPrimary: Array<{
    material_id: number
    category: "bias"
    type: "primary"
    injection_month: string
  }> = []

  for (const materialId of data_target_bias_primary) {
    const materials = await db
      .selectFrom("ws_materials")
      .select(["id"])
      .where("global_id", "=", materialId)
      .where("program_id", "=", 1)
      .where("material_level_id", "=", 3)
      .execute()

    for (const material of materials) {
      if (!existingMaterialIds.has(material.id)) {
        insertsBiasPrimary.push({
          material_id: material.id,
          category: "bias",
          type: "primary",
          injection_month: "november",
        })
        insertsBiasPrimary.push({
          material_id: material.id,
          category: "bias",
          type: "primary",
          injection_month: "august",
        })
      }
    }
  }

  if (insertsBiasPrimary.length > 0) {
    await db.insertInto(TABLE_NAME).values(insertsBiasPrimary).execute()
  }

  const insertsBiasAdditional: Array<{
    material_id: number
    category: "bias"
    type: "additional"
    injection_month: string
  }> = []

  for (const materialId of data_target_bias_additional) {
    const materials = await db
      .selectFrom("ws_materials")
      .select(["id"])
      .where("global_id", "=", materialId)
      .where("program_id", "=", 1)
      .where("material_level_id", "=", 3)
      .execute()

    for (const material of materials) {
      if (!existingMaterialIds.has(material.id)) {
        if (materialId !== 3535) {
          insertsBiasAdditional.push({
            material_id: material.id,
            category: "bias",
            type: "additional",
            injection_month: "november",
          })
        }
        insertsBiasAdditional.push({
          material_id: material.id,
          category: "bias",
          type: "additional",
          injection_month: "august",
        })
      }
    }
  }

  if (insertsBiasAdditional.length > 0) {
    await db.insertInto(TABLE_NAME).values(insertsBiasAdditional).execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`TRUNCATE TABLE ${sql.table(TABLE_NAME)}`.execute(db)
}
