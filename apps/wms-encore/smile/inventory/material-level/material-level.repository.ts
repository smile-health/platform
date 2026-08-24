// Real Kysely queries against "material_levels" — ported from apps/core's
// MaterialLevelRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { MaterialLevelsTable } from "../../../core/db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type MaterialLevelRow = Selectable<MaterialLevelsTable>;

export async function findById(id: number): Promise<MaterialLevelRow | undefined> {
  let query = db.selectFrom("material_levels").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<MaterialLevelRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<MaterialLevelRow[]> {
  let query = db.selectFrom("material_levels").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<MaterialLevelRow[]>;
}

export async function create(data: Insertable<MaterialLevelsTable>): Promise<number> {
  const result = await db
    .insertInto("material_levels")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<MaterialLevelsTable>): Promise<void> {
  await db
    .updateTable("material_levels")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number): Promise<void> {
  await db
    .updateTable("material_levels")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .execute();
}
