// Real Kysely queries against "export_histories" — ported from apps/core's
// ExportHistoryRepository. Generic list/findById/create/update/softDelete, matching
// the shape of the original's core CRUD (module-specific methods beyond
// this weren't ported — see the module's original repository if you need them).
import { db } from "../db";
import type { ExportHistoriesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type ExportHistoryRow = Selectable<ExportHistoriesTable>;

export async function findById(id: number): Promise<ExportHistoryRow | undefined> {
  let query = db.selectFrom("export_histories").selectAll().where("id", "=", id);
  return query.executeTakeFirst() as Promise<ExportHistoryRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<ExportHistoryRow[]> {
  let query = db.selectFrom("export_histories").selectAll();
  if (params.search) {
    query = query.where("filename", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<ExportHistoryRow[]>;
}

export async function create(data: Insertable<ExportHistoriesTable>): Promise<number> {
  const result = await db
    .insertInto("export_histories")
    .values(data)
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<ExportHistoriesTable>): Promise<void> {
  await db
    .updateTable("export_histories")
    .set({ ...data, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}
