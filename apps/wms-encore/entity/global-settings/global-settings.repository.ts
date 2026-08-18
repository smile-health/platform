// Postgres columns for table `global_settings` (mirrors
// infrastructure/database/models/GlobalSettingsModel.ts field-for-field):
//
//   id            integer, unsigned, auto-increment, primary key
//   created_by    varchar(36), not null
//   updated_by    varchar(36), not null
//   setting_name  varchar(64), not null, UNIQUE (setting_name_unique index)
//   setting_value varchar(255), not null
//   created_at    timestamp, not null
//   updated_at    timestamp, not null
//   deleted_at    timestamp, nullable (paranoid soft-delete)
//   deleted_by    bigint, nullable

import { db } from "../db";
import type { GlobalSettings, PaginationMeta } from "./global-settings.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  setting_name: string;
  setting_value: string;
  created_at: Date;
  updated_at: Date;
}): GlobalSettings {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    settingName: row.setting_name,
    settingValue: row.setting_value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findById(id: number): Promise<GlobalSettings | null> {
  const row = await db
    .selectFrom("global_settings")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
}): Promise<{ data: GlobalSettings[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("global_settings").where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("setting_name", "ilike", `%${params.search}%`);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map(toEntity),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

export async function create(payload: {
  createdBy: string;
  settingName: string;
  settingValue: string;
}): Promise<GlobalSettings> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("global_settings")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      setting_name: payload.settingName,
      setting_value: payload.settingValue,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: { updatedBy: string; settingName?: string; settingValue?: string }
): Promise<GlobalSettings | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("global_settings")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      setting_name: payload.settingName ?? existing.settingName,
      setting_value: payload.settingValue ?? existing.settingValue,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .updateTable("global_settings")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
