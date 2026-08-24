// Real Kysely queries against "material_subtypes". Pulled out of
// material.validation.ts's inline subtype-belongs-to-type check and
// material.excel.ts's inline db.selectFrom("material_subtypes") calls so
// both go through one place (see material-type.repository.ts, same idea).
import { db } from "../db";
import type { MaterialSubtypesTable } from "../../../core/db.types";
import type { Selectable } from "kysely";

export type MaterialSubtypeRow = Selectable<MaterialSubtypesTable>;

export async function findById(id: number): Promise<MaterialSubtypeRow | undefined> {
  return db
    .selectFrom("material_subtypes")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<MaterialSubtypeRow | undefined>;
}

export async function findAll(): Promise<MaterialSubtypeRow[]> {
  return db.selectFrom("material_subtypes").selectAll().where("deleted_at", "is", null).execute() as Promise<MaterialSubtypeRow[]>;
}
