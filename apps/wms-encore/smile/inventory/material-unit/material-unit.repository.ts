// Real Kysely queries against "material_units" — ported from apps/core's
// MaterialUnitRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { MaterialUnitsTable } from "../../../core/db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type MaterialUnitRow = Selectable<MaterialUnitsTable>;

export async function findById(id: number): Promise<MaterialUnitRow | undefined> {
  let query = db.selectFrom("material_units").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<MaterialUnitRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<MaterialUnitRow[]> {
  let query = db.selectFrom("material_units").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<MaterialUnitRow[]>;
}

export async function create(data: Insertable<MaterialUnitsTable>): Promise<number> {
  const result = await db
    .insertInto("material_units")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<MaterialUnitsTable>): Promise<void> {
  await db
    .updateTable("material_units")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number): Promise<void> {
  await db
    .updateTable("material_units")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .execute();
}
