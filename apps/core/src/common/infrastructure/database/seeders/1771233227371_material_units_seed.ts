import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const materialUnits = [
    { name: "pcs", type: "distribution" },
    { name: "doses", type: "distribution" },
    { name: "ml", type: "distribution" },
    { name: "tablet", type: "distribution" },
    { name: "gram", type: "distribution" },
    { name: "cc", type: "distribution" },
    { name: "ampul", type: "distribution" },
    { name: "vial", type: "distribution" },
    { name: "kapsul", type: "distribution" },
    { name: "botol", type: "distribution" },
    { name: "unit", type: "distribution" },
    { name: "pack", type: "distribution" },
    { name: "tube", type: "distribution" },
    { name: "kit", type: "distribution" },
    { name: "sachet", type: "distribution" },
    { name: "jerigen", type: "distribution" },
    { name: "pasang", type: "distribution" },
    { name: "strip", type: "distribution" },
    { name: "set", type: "distribution" },
  ]

  // Get all existing data
  const existingRecords = await db
    .selectFrom("material_units")
    .select(["name", "type"])
    .where(
      "name",
      "in",
      materialUnits.map((m) => m.name)
    )
    .execute()

  const filteredMaterialUnits = materialUnits.filter(
    (m) => !existingRecords.some((r) => r.name === m.name && r.type === m.type)
  )

  if (filteredMaterialUnits.length > 0)
    await db
      .insertInto("material_units")
      .values(filteredMaterialUnits)
      .execute()
}
