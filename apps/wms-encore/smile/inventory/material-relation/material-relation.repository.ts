// Real Kysely queries against "material_relations" — ported from apps/core's
// MaterialRelationRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { MaterialRelationsTable } from "../../../core/db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type MaterialRelationRow = Selectable<MaterialRelationsTable>;

export async function findById(id: number): Promise<MaterialRelationRow | undefined> {
  let query = db.selectFrom("material_relations").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<MaterialRelationRow | undefined>;
}

export async function list(params: { limit: number; page: number }): Promise<MaterialRelationRow[]> {
  let query = db.selectFrom("material_relations").selectAll();
  query = query.where("deleted_at", "is", null);
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<MaterialRelationRow[]>;
}

export async function create(data: Insertable<MaterialRelationsTable>): Promise<number> {
  const result = await db
    .insertInto("material_relations")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<MaterialRelationsTable>): Promise<void> {
  await db
    .updateTable("material_relations")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number): Promise<void> {
  await db
    .updateTable("material_relations")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .execute();
}
