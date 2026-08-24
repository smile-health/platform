// Real Kysely queries against "protocols" — ported from apps/core's
// ProtocolRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { ProtocolsTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type ProtocolRow = Selectable<ProtocolsTable>;

export async function findById(id: number): Promise<ProtocolRow | undefined> {
  let query = db.selectFrom("protocols").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<ProtocolRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<ProtocolRow[]> {
  let query = db.selectFrom("protocols").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<ProtocolRow[]>;
}

export async function create(data: Insertable<ProtocolsTable>, createdBy: number): Promise<number> {
  const result = await db
    .insertInto("protocols")
    .values({ ...data, created_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<ProtocolsTable>, updatedBy: number): Promise<void> {
  await db
    .updateTable("protocols")
    .set({ ...data, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number, deletedBy: number): Promise<void> {
  await db
    .updateTable("protocols")
    .set({ deleted_at: new Date(), updated_by: deletedBy })
    .where("id", "=", id)
    .execute();
}
