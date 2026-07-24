import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const materialSubtypesTable = "material_subtypes"
  const materialSubtypeRelationsTable = "material_subtype_relations"

  const materialSubtypes = [
    { id: 1, name: "Vaccine", material_type_id: 2 },
    { id: 2, name: "Diluents", material_type_id: 2 },
    { id: 3, name: "Injection Device", material_type_id: 4 },
    { id: 4, name: "Storage Box", material_type_id: 4 },
    { id: 5, name: "Vaccine Vial Set", material_type_id: 2 },
  ]

  for (const subtype of materialSubtypes) {
    await db
      .insertInto(materialSubtypesTable)
      .values(subtype)
      .onDuplicateKeyUpdate({
        name: subtype.name,
        material_type_id: subtype.material_type_id
      })
      .execute()
  }

  const materialSubtypeRelations = [
    { id: 1, from_material_subtype_id: 1, to_material_subtype_id: 2 }, // Vaccine -> Diluents
    { id: 2, from_material_subtype_id: 1, to_material_subtype_id: 3 }, // Vaccine -> Injection Device
    { id: 3, from_material_subtype_id: 3, to_material_subtype_id: 4 }, // Injection Device -> Storage Box
    { id: 4, from_material_subtype_id: 1, to_material_subtype_id: 4 }, // Vaccine -> Storage Box
    { id: 5, from_material_subtype_id: 1, to_material_subtype_id: 5 }, // Vaccine -> Vaccine Vial Set
    { id: 6, from_material_subtype_id: 5, to_material_subtype_id: 4 }, // Vaccine Vial Set -> Storage Box
  ]

  for (const relation of materialSubtypeRelations) {
    await db
      .insertInto(materialSubtypeRelationsTable)
      .values(relation)
      .onDuplicateKeyUpdate({
        from_material_subtype_id: relation.from_material_subtype_id,
        to_material_subtype_id: relation.to_material_subtype_id,
      })
      .execute()
  }
}
