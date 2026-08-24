// Real Kysely queries against "workspaces" — ported from apps/core's
// WorkspaceRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { WorkspacesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type WorkspaceRow = Selectable<WorkspacesTable>;

export async function findById(id: number): Promise<WorkspaceRow | undefined> {
  let query = db.selectFrom("workspaces").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<WorkspaceRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<WorkspaceRow[]> {
  let query = db.selectFrom("workspaces").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<WorkspaceRow[]>;
}

export async function create(data: Insertable<WorkspacesTable>, createdBy: number): Promise<number> {
  const result = await db
    .insertInto("workspaces")
    .values({ ...data, created_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<WorkspacesTable>, updatedBy: number): Promise<void> {
  await db
    .updateTable("workspaces")
    .set({ ...data, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number, deletedBy: number): Promise<void> {
  await db
    .updateTable("workspaces")
    .set({ deleted_at: new Date(), updated_by: deletedBy })
    .where("id", "=", id)
    .execute();
}
