import { db } from "../db-wms";
import type { EntitySettings } from "./entity-settings.types";

// The original Sequelize model is `paranoid: true` (soft delete via deleted_at) —
// every read query here filters `deleted_at IS NULL` to match that behavior.

function toEntitySettings(row: {
  id: number;
  entity_id: number;
  setting_name: string;
  setting_value: string;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
}): EntitySettings {
  return {
    id: row.id,
    entityId: row.entity_id,
    settingName: row.setting_name,
    settingValue: row.setting_value,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function checkDuplication(
  entityId: number,
  settingName: string,
  settingValue: string
): Promise<boolean> {
  const row = await db
    .selectFrom("entity_settings")
    .select("id")
    .where("entity_id", "=", entityId)
    .where("setting_name", "=", settingName)
    .where("setting_value", "=", settingValue)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  // Mirrors EntitySettingsRepositoryImpl.checkDuplication: returns false when a
  // duplicate row already exists, true when it's safe to create.
  return !row;
}

export async function createEntitySettings(payload: {
  entityId: number;
  settingName: string;
  settingValue: string;
  createdBy: string;
}): Promise<EntitySettings> {
  const row = await db
    .insertInto("entity_settings")
    .values({
      entity_id: payload.entityId,
      setting_name: payload.settingName,
      setting_value: payload.settingValue,
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return toEntitySettings(row);
}

export async function findEntitySettingsById(id: number): Promise<EntitySettings | null> {
  const row = await db
    .selectFrom("entity_settings")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  return row ? toEntitySettings(row) : null;
}

export async function findAllEntitySettings(
  limit: number,
  page: number,
  search: string | undefined,
  entityId: string | undefined
): Promise<{
  data: EntitySettings[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
}> {
  let query = db.selectFrom("entity_settings").where("deleted_at", "is", null);
  let countQuery = db.selectFrom("entity_settings").where("deleted_at", "is", null);

  if (search) {
    query = query.where("setting_name", "ilike", `%${search}%`);
    countQuery = countQuery.where("setting_name", "ilike", `%${search}%`);
  }
  if (entityId) {
    query = query.where("entity_id", "=", Number(entityId));
    countQuery = countQuery.where("entity_id", "=", Number(entityId));
  }

  const countRow = await countQuery
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("updated_at", "desc")
    .limit(limit)
    .offset((page - 1) * limit)
    .execute();

  return {
    data: rows.map(toEntitySettings),
    pagination: {
      total,
      pages: limit > 0 ? Math.ceil(total / limit) : 0,
      currentPage: page,
      perPage: limit,
    },
  };
}

export async function updateEntitySettings(payload: {
  id: number;
  entityId: number;
  settingName: string;
  settingValue: string;
  updatedBy: string;
}): Promise<void> {
  await db
    .updateTable("entity_settings")
    .set({
      entity_id: payload.entityId,
      setting_name: payload.settingName,
      setting_value: payload.settingValue,
      updated_by: payload.updatedBy,
      updated_at: new Date(),
    })
    .where("id", "=", payload.id)
    .execute();
}

export async function deleteEntitySettings(id: number): Promise<boolean> {
  const result = await db
    .updateTable("entity_settings")
    .set({ deleted_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  return Number(result.numUpdatedRows) > 0;
}
