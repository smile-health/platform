// Real Kysely queries against "entity_types" — ported from apps/core's
// EntityTypeRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { EntityTypesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type EntityTypeRow = Selectable<EntityTypesTable>;

export async function findById(id: number): Promise<EntityTypeRow | undefined> {
  let query = db.selectFrom("entity_types").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<EntityTypeRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<EntityTypeRow[]> {
  let query = db.selectFrom("entity_types").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<EntityTypeRow[]>;
}

export async function create(data: Insertable<EntityTypesTable>): Promise<number> {
  const result = await db
    .insertInto("entity_types")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<EntityTypesTable>): Promise<void> {
  await db
    .updateTable("entity_types")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number): Promise<void> {
  await db
    .updateTable("entity_types")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .execute();
}
