// Real Kysely queries against "material_types" — a reference/lookup table
// with no dedicated controller yet (see material-subtype's scaffold for the
// same situation). Pulled out of material.validation.ts and material.excel.ts's
// inline db.selectFrom("material_types") calls so both go through one place.
import { db } from "../db";
import type { MaterialTypesTable } from "../../../core/db.types";
import type { Selectable } from "kysely";

export type MaterialTypeRow = Selectable<MaterialTypesTable>;

export async function findById(id: number): Promise<MaterialTypeRow | undefined> {
  return db
    .selectFrom("material_types")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<MaterialTypeRow | undefined>;
}

export async function findAll(): Promise<MaterialTypeRow[]> {
  return db.selectFrom("material_types").selectAll().where("deleted_at", "is", null).execute() as Promise<MaterialTypeRow[]>;
}
