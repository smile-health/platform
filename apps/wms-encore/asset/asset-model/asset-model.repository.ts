// Postgres columns for table `asset_model` (mirrors
// infrastructure/database/models/AssetModel.ts field-for-field):
//
//   id              integer, unsigned, auto-increment, primary key
//   created_by      varchar(36), not null
//   updated_by      varchar(36), not null
//   asset_type      enum('SCALE','INCINERATOR','AUTOCLAVE','COLD_STORAGE'), not null
//   manufacturer_id integer, unsigned, not null (FK -> asset_manufacturer.id, ON DELETE CASCADE)
//   name            varchar(64), not null
//   description     varchar(255), nullable
//   created_at      timestamp, not null
//   updated_at      timestamp, not null
//   deleted_at      timestamp, nullable (paranoid soft-delete)
//   deleted_by      bigint, nullable
//
// Joined table `asset_manufacturer` (only the columns this module reads):
//
//   id              integer, unsigned, auto-increment, primary key
//   name            varchar, not null
//   description     varchar, nullable
//   deleted_at      timestamp, nullable (paranoid soft-delete)
//
// Referenced table `healthcare_facility_asset` (existence-guard on delete
// only; mirrors HealthcareFacilityAssetImpl.findHealthcareFacilityAssetByCondition):
//
//   model_id        integer, unsigned, not null (FK -> asset_model.id)
//   deleted_at      timestamp, nullable (paranoid soft-delete)

import { db } from "../../db/db";
import type { AssetModelTable } from "../../db/db";
import type { AssetModel, AssetManufacturerSummary, PaginationMeta } from "./asset-model.types";

// Zod already validates assetType against the enum before this is called
// (see asset-model.schema.ts) — this cast just tells Kysely the wire string
// is one of the enum's members, matching the pattern used elsewhere for
// enum columns (e.g. schedule-event.service.ts's ScheduledEventType cast).
function toAssetType(value: string): AssetModelTable["asset_type"] {
  return value as AssetModelTable["asset_type"];
}

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  asset_type: string;
  manufacturer_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  manufacturer_name?: string | null;
  manufacturer_description?: string | null;
}): AssetModel {
  const manufacturer: AssetManufacturerSummary | undefined =
    row.manufacturer_name != null
      ? {
          id: row.manufacturer_id,
          name: row.manufacturer_name,
          description: row.manufacturer_description ?? undefined,
        }
      : undefined;

  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    assetType: row.asset_type,
    manufacturerId: row.manufacturer_id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    manufacturer,
  };
}

// Mirrors getAssetModelById's left-join on assetManufacturer (required: false).
function baseSelectWithManufacturer() {
  return db
    .selectFrom("asset_model")
    .leftJoin("asset_manufacturer", "asset_manufacturer.id", "asset_model.manufacturer_id")
    .select([
      "asset_model.id",
      "asset_model.created_by",
      "asset_model.updated_by",
      "asset_model.asset_type",
      "asset_model.manufacturer_id",
      "asset_model.name",
      "asset_model.description",
      "asset_model.created_at",
      "asset_model.updated_at",
      "asset_manufacturer.name as manufacturer_name",
      "asset_manufacturer.description as manufacturer_description",
    ]);
}

export async function findById(id: number): Promise<AssetModel | null> {
  const row = await baseSelectWithManufacturer()
    .where("asset_model.id", "=", id)
    .where("asset_model.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  assetType?: string;
  manufacturerId?: number;
}): Promise<{ data: AssetModel[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("asset_model").where("asset_model.deleted_at", "is", null);
  if (params.search) {
    query = query.where("asset_model.name", "ilike", `%${params.search}%`);
  }
  if (params.assetType) {
    query = query.where("asset_model.asset_type", "=", toAssetType(params.assetType));
  }
  if (params.manufacturerId) {
    query = query.where("asset_model.manufacturer_id", "=", params.manufacturerId);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  let listQuery = baseSelectWithManufacturer().where("asset_model.deleted_at", "is", null);
  if (params.search) {
    listQuery = listQuery.where("asset_model.name", "ilike", `%${params.search}%`);
  }
  if (params.assetType) {
    listQuery = listQuery.where("asset_model.asset_type", "=", toAssetType(params.assetType));
  }
  if (params.manufacturerId) {
    listQuery = listQuery.where("asset_model.manufacturer_id", "=", params.manufacturerId);
  }

  const rows = await listQuery
    .orderBy("asset_model.updated_at", "desc")
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

export async function manufacturerExists(manufacturerId: number): Promise<boolean> {
  const row = await db
    .selectFrom("asset_manufacturer")
    .select("id")
    .where("id", "=", manufacturerId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

// Mirrors DeleteAssetModel's guard: refuse deletion while any
// healthcare_facility_asset row still references this asset_model as its
// model_id.
export async function isReferencedByHealthcareFacilityAsset(assetModelId: number): Promise<boolean> {
  const row = await db
    .selectFrom("healthcare_facility_asset")
    .select("id")
    .where("model_id", "=", assetModelId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

export async function create(payload: {
  createdBy: string;
  assetType: string;
  manufacturerId: number;
  name: string;
  description?: string;
}): Promise<AssetModel> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("asset_model")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      asset_type: toAssetType(payload.assetType),
      manufacturer_id: payload.manufacturerId,
      name: payload.name,
      description: payload.description ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    assetType: string;
    manufacturerId: number;
    name: string;
    description?: string;
  }
): Promise<AssetModel | null> {
  const existing = await findById(id);
  if (!existing) return null;

  await db
    .updateTable("asset_model")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      asset_type: toAssetType(payload.assetType),
      manufacturer_id: payload.manufacturerId,
      name: payload.name,
      description: payload.description ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return findById(id);
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .updateTable("asset_model")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
