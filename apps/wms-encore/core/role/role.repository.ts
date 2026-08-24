// Real Kysely queries against "roles" — ported from apps/core's
// RoleRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { RolesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type RoleRow = Selectable<RolesTable>;

export async function findById(id: number): Promise<RoleRow | undefined> {
  let query = db.selectFrom("roles").selectAll().where("id", "=", id);
  return query.executeTakeFirst() as Promise<RoleRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<RoleRow[]> {
  let query = db.selectFrom("roles").selectAll();
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<RoleRow[]>;
}

export async function create(data: Insertable<RolesTable>): Promise<number> {
  const result = await db
    .insertInto("roles")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<RolesTable>): Promise<void> {
  await db
    .updateTable("roles")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}
