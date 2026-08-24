// Real Kysely queries against "budget_sources" — ported from apps/core's
// BudgetSourceRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { BudgetSourcesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type BudgetSourceRow = Selectable<BudgetSourcesTable>;

export async function findById(id: number): Promise<BudgetSourceRow | undefined> {
  let query = db.selectFrom("budget_sources").selectAll().where("id", "=", id);
  query = query.where("deleted_at", "is", null);
  return query.executeTakeFirst() as Promise<BudgetSourceRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<BudgetSourceRow[]> {
  let query = db.selectFrom("budget_sources").selectAll();
  query = query.where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("name", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<BudgetSourceRow[]>;
}

export async function create(data: Insertable<BudgetSourcesTable>, createdBy: number): Promise<number> {
  const result = await db
    .insertInto("budget_sources")
    .values({ ...data, created_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<BudgetSourcesTable>, updatedBy: number): Promise<void> {
  await db
    .updateTable("budget_sources")
    .set({ ...data, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function softDelete(id: number, deletedBy: number): Promise<void> {
  await db
    .updateTable("budget_sources")
    .set({ deleted_at: new Date(), updated_by: deletedBy })
    .where("id", "=", id)
    .execute();
}
