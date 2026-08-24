// Real Kysely queries against "entity_tags" — ported from apps/core's
// EntityTagRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { EntityTagsTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type EntityTagRow = Selectable<EntityTagsTable>;

export async function findById(id: number): Promise<EntityTagRow | undefined> {
  let query = db.selectFrom("entity_tags").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<EntityTagRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<EntityTagRow[]> {
  let query = db.selectFrom("entity_tags").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("title", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<EntityTagRow[]>;
}

export async function create(data: Insertable<EntityTagsTable>): Promise<number> {
  const result = await db
    .insertInto("entity_tags")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<EntityTagsTable>): Promise<void> {
  await db
    .updateTable("entity_tags")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number): Promise<void> {
  await db
    .updateTable("entity_tags")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .execute();
}
