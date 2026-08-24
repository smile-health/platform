// Postgres columns (mirrors infrastructure/database/models/HealthcareFacilityAssetModel.ts,
// AssetModel.ts and AssetManufacturerModel.ts field-for-field):
//
// table `healthcare_facility_asset`:
//   id                     integer, unsigned, auto-increment, primary key
//   created_by             varchar(36), not null
//   updated_by             varchar(36), not null
//   healthcare_facility_id integer, not null
//   model_id               integer, not null
//   is_iot_enabled         boolean, not null, default false
//   asset_id               varchar(32), nullable
//   asset_status           enum('OPERATIONAL','UNDER_MAINTAINENCE','OUT_OF_SERVICE','IDLE','RETIRED'), nullable
//   warranty_start_date    date, nullable
//   warranty_end_date      date, nullable
//   year_of_production     integer, nullable
//   created_at             timestamp, not null
//   updated_at             timestamp, not null
//   deleted_at             timestamp, nullable (paranoid soft-delete)
//   deleted_by             bigint, nullable
//
// table `asset_model` (joined as assetModel, mirrors AssetModel.ts):
//   id, created_by, updated_by, asset_type, manufacturer_id, name, description,
//   created_at, updated_at, deleted_at, deleted_by
//
// table `asset_manufacturer` (joined as assetManufacturer, mirrors AssetManufacturerModel.ts):
//   id, created_by, updated_by, name, description, created_at, updated_at, deleted_at, deleted_by
//
// table `healthcare_facility_asset_activity` (queried for the "entity" list
// endpoint's latest calibration/maintenance dates — this module does NOT own
// that table; healthcare-facility-asset-activity is a sibling module, see
// HealthcareFacilityAssetActivityModel.ts):
//   created_by, created_at, hf_asset_id, operator_id, activity_type
//   (enum('MAINTENANCE','CALIBRATION')), start_date, end_date, deleted_at, deleted_by
//
// `entities` table lookups (for entityName on the plain list endpoint) reuse
// ../../core/entities/entities.repository's getEntityId — see the
// deviation note on findAllPaginated below.

import { db } from "../db";
import { getEntityId } from "../../../core/entities/entities.repository";
import type { HealthcareFacilityAssetTable } from "../../../db/db";
import type { AssetManufacturer, AssetModel, HealthcareFacilityAsset, PaginationMeta } from "./healthcare-facility-asset.types";

// Zod already validates assetStatus against the enum before this is called —
// this cast just tells Kysely the wire string is one of the enum's members,
// same pattern as asset-model.repository.ts's toAssetType.
function toAssetStatus(value: string): HealthcareFacilityAssetTable["asset_status"] {
  return value as HealthcareFacilityAssetTable["asset_status"];
}

// Wire dates are strings (YYYY-MM-DD); the column is a real Postgres DATE.
function toDateOrNull(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

interface HfAssetRow {
  id: number;
  created_by: string;
  updated_by: string;
  healthcare_facility_id: number;
  model_id: number;
  is_iot_enabled: boolean;
  asset_id: string;
  asset_status: string;
  warranty_start_date: Date | null;
  warranty_end_date: Date | null;
  year_of_production: number | null;
  created_at: Date;
  updated_at: Date;
}

interface JoinedRow extends HfAssetRow {
  am_id: number | null;
  am_name: string | null;
  am_description: string | null;
  am_asset_type: string | null;
  am_manufacturer_id: number | null;
  am_created_at: Date | null;
  am_updated_at: Date | null;
  am_created_by: string | null;
  am_updated_by: string | null;
  amf_id: number | null;
  amf_name: string | null;
  amf_description: string | null;
  amf_created_by: string | null;
  amf_updated_by: string | null;
}

function toAssetModel(row: JoinedRow): AssetModel | undefined {
  if (row.am_id === null) return undefined;
  const manufacturer: AssetManufacturer | undefined =
    row.amf_id !== null
      ? {
          id: row.amf_id,
          name: row.amf_name ?? "",
          description: row.amf_description ?? undefined,
          createdBy: row.amf_created_by ?? undefined,
          updatedBy: row.amf_updated_by ?? undefined,
        }
      : undefined;
  return {
    id: row.am_id,
    name: row.am_name ?? "",
    description: row.am_description ?? undefined,
    assetType: row.am_asset_type ?? undefined,
    manufacturerId: row.am_manufacturer_id ?? 0,
    createdAt: row.am_created_at ?? undefined,
    updatedAt: row.am_updated_at ?? undefined,
    createdBy: row.am_created_by ?? undefined,
    updatedBy: row.am_updated_by ?? undefined,
    manufacturer,
  };
}

function toEntity(row: JoinedRow): HealthcareFacilityAsset {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    assetStatus: row.asset_status,
    healthcareFacilityId: row.healthcare_facility_id,
    assetId: row.asset_id,
    modelId: row.model_id,
    isIotEnable: row.is_iot_enabled,
    warrantyStartDate: row.warranty_start_date ?? undefined,
    warrantyEndDate: row.warranty_end_date ?? undefined,
    yearOfProduction: row.year_of_production ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assetModel: toAssetModel(row),
  };
}

function baseJoinQuery() {
  return db
    .selectFrom("healthcare_facility_asset")
    .innerJoin("asset_model", "asset_model.id", "healthcare_facility_asset.model_id")
    .innerJoin("asset_manufacturer", "asset_manufacturer.id", "asset_model.manufacturer_id")
    .where("healthcare_facility_asset.deleted_at", "is", null)
    .select([
      "healthcare_facility_asset.id as id",
      "healthcare_facility_asset.created_by as created_by",
      "healthcare_facility_asset.updated_by as updated_by",
      "healthcare_facility_asset.healthcare_facility_id as healthcare_facility_id",
      "healthcare_facility_asset.model_id as model_id",
      "healthcare_facility_asset.is_iot_enabled as is_iot_enabled",
      "healthcare_facility_asset.asset_id as asset_id",
      "healthcare_facility_asset.asset_status as asset_status",
      "healthcare_facility_asset.warranty_start_date as warranty_start_date",
      "healthcare_facility_asset.warranty_end_date as warranty_end_date",
      "healthcare_facility_asset.year_of_production as year_of_production",
      "healthcare_facility_asset.created_at as created_at",
      "healthcare_facility_asset.updated_at as updated_at",
      "asset_model.id as am_id",
      "asset_model.name as am_name",
      "asset_model.description as am_description",
      "asset_model.asset_type as am_asset_type",
      "asset_model.manufacturer_id as am_manufacturer_id",
      "asset_model.created_at as am_created_at",
      "asset_model.updated_at as am_updated_at",
      "asset_model.created_by as am_created_by",
      "asset_model.updated_by as am_updated_by",
      "asset_manufacturer.id as amf_id",
      "asset_manufacturer.name as amf_name",
      "asset_manufacturer.description as amf_description",
      "asset_manufacturer.created_by as amf_created_by",
      "asset_manufacturer.updated_by as amf_updated_by",
    ]);
}

export async function findById(id: number): Promise<HealthcareFacilityAsset | null> {
  // Original uses `required: true` on both the assetModel and
  // assetManufacturer includes, i.e. an INNER JOIN — a row whose model or
  // manufacturer was soft-deleted/missing would come back as "not found"
  // even though the healthcare_facility_asset row itself exists. Preserved
  // verbatim via innerJoin here (not leftJoin).
  const row = (await baseJoinQuery().where("healthcare_facility_asset.id", "=", id).executeTakeFirst()) as
    | JoinedRow
    | undefined;
  return row ? toEntity(row) : null;
}

export async function findAssetModelExists(modelId: number): Promise<boolean> {
  const row = await db
    .selectFrom("asset_model")
    .select("id")
    .where("id", "=", modelId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return !!row;
}

export async function findAllPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  healthcareFacilityId?: number;
  assetType?: string;
  manufacturerId?: number;
  isIotEnable?: number;
  assetStatus?: string;
}): Promise<{ data: HealthcareFacilityAsset[]; pagination: PaginationMeta }> {
  let query = baseJoinQuery();

  if (params.search) {
    // Original: Op.or over `assetModel.name` LIKE and
    // `assetModel.assetManufacturer.name` LIKE (case-sensitive MySQL LIKE).
    // Ported to Postgres ILIKE per convention #5.
    query = query.where((eb) =>
      eb.or([
        eb("asset_model.name", "ilike", `%${params.search}%`),
        eb("asset_manufacturer.name", "ilike", `%${params.search}%`),
      ])
    );
  }
  if (params.healthcareFacilityId) {
    query = query.where("healthcare_facility_asset.healthcare_facility_id", "=", params.healthcareFacilityId);
  }
  if (params.isIotEnable) {
    // Original: `...(isIotEnable && { isIotEnabled: isIotEnable })` — a
    // falsy/0 isIotEnable is silently treated as "no filter", only a
    // truthy (1) value filters. Preserved verbatim: 0 does not filter to
    // "IoT disabled only".
    query = query.where("healthcare_facility_asset.is_iot_enabled", "=", true);
  }
  // Original: `...(assetStatus ? { assetStatus } : { assetStatus: 'OPERATIONAL' })`
  // — when assetStatus isn't supplied, the query silently defaults to
  // OPERATIONAL-only instead of "no filter". A real bug upstream, preserved
  // verbatim rather than fixed.
  query = query.where("healthcare_facility_asset.asset_status", "=", toAssetStatus(params.assetStatus || "OPERATIONAL"));
  if (params.assetType) {
    query = query.where("asset_model.asset_type", "=", params.assetType as "SCALE" | "INCINERATOR" | "AUTOCLAVE" | "COLD_STORAGE");
  }
  if (params.manufacturerId) {
    query = query.where("asset_model.manufacturer_id", "=", params.manufacturerId);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = (await query
    .orderBy("healthcare_facility_asset.updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute()) as JoinedRow[];

  // Deviation: the original fetches `entityName` via
  // infrastructure/external-apis/thirdPartyClient's getEntityDetail, which
  // hits a Redis cache, then this same wms-service's own `entities` table
  // (EntitiesModel.findByPk), then falls back to an HTTP call to
  // apps/core over the network. Since the `entities` table lives in this
  // same database and a same-DB entities.repository already exists in this
  // port (../../core/entities/entities.repository), entityName is
  // resolved directly against that table instead of replicating the
  // Redis-then-HTTP-fallback plumbing here. Functionally equivalent for the
  // common case (entity row present locally); the HTTP-fallback path (entity
  // known only to apps/core, not yet synced locally) is not reproduced.
  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      const entityDetail = await getEntityId(row.healthcare_facility_id);
      entity.entityName = entityDetail?.name;
      return entity;
    })
  );

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

export async function findAllByEntityId(params: {
  limit: number;
  page: number;
  healthcareFacilityId: number;
  search?: string;
  assetType?: string;
  manufacturerId?: number;
}): Promise<{ data: HealthcareFacilityAsset[]; pagination: PaginationMeta }> {
  let query = baseJoinQuery().where(
    "healthcare_facility_asset.healthcare_facility_id",
    "=",
    params.healthcareFacilityId
  );

  if (params.search) {
    query = query.where((eb) =>
      eb.or([
        eb("asset_model.name", "ilike", `%${params.search}%`),
        eb("asset_manufacturer.name", "ilike", `%${params.search}%`),
      ])
    );
  }
  if (params.assetType) {
    query = query.where("asset_model.asset_type", "=", params.assetType as "SCALE" | "INCINERATOR" | "AUTOCLAVE" | "COLD_STORAGE");
  }
  if (params.manufacturerId) {
    query = query.where("asset_model.manufacturer_id", "=", params.manufacturerId);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = (await query
    .orderBy("healthcare_facility_asset.updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute()) as JoinedRow[];

  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      const [maintenance, calibration] = await Promise.all([
        db
          .selectFrom("healthcare_facility_asset_activity")
          .select("created_at")
          .where("hf_asset_id", "=", row.id)
          .where("activity_type", "=", "MAINTENANCE")
          .where("deleted_at", "is", null)
          .orderBy("created_at", "desc")
          .executeTakeFirst(),
        db
          .selectFrom("healthcare_facility_asset_activity")
          .select("created_at")
          .where("hf_asset_id", "=", row.id)
          .where("activity_type", "=", "CALIBRATION")
          .where("deleted_at", "is", null)
          .orderBy("created_at", "desc")
          .executeTakeFirst(),
      ]);
      entity.dateMaintenanceActivity = maintenance?.created_at ?? undefined;
      entity.dateCalibrationActivity = calibration?.created_at ?? undefined;
      return entity;
    })
  );

  return {
    data,
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
  assetStatus: string;
  healthcareFacilityId: number;
  assetId: string;
  modelId: number;
  isIotEnable: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  yearOfProduction?: number;
}): Promise<HealthcareFacilityAsset> {
  const row = await db
    .insertInto("healthcare_facility_asset")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      asset_status: payload.assetStatus ? toAssetStatus(payload.assetStatus) : null,
      healthcare_facility_id: payload.healthcareFacilityId,
      asset_id: payload.assetId,
      model_id: payload.modelId,
      is_iot_enabled: payload.isIotEnable,
      warranty_start_date: toDateOrNull(payload.warrantyStartDate),
      warranty_end_date: toDateOrNull(payload.warrantyEndDate),
      year_of_production: payload.yearOfProduction ?? null,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  const created = await findById(row.id);
  // findById inner-joins asset_model/asset_manufacturer, both of which are
  // already validated to exist by the service layer before create() is
  // called, so this should never be null in practice.
  return created!;
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    assetStatus?: string;
    healthcareFacilityId?: number;
    assetId?: string;
    modelId?: number;
    isIotEnable?: boolean;
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    yearOfProduction?: number;
  }
): Promise<HealthcareFacilityAsset | null> {
  const existing = await findById(id);
  if (!existing) return null;

  await db
    .updateTable("healthcare_facility_asset")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      asset_status: payload.assetStatus
        ? toAssetStatus(payload.assetStatus)
        : existing.assetStatus
          ? toAssetStatus(existing.assetStatus)
          : null,
      healthcare_facility_id: payload.healthcareFacilityId ?? existing.healthcareFacilityId,
      asset_id: payload.assetId ?? existing.assetId,
      model_id: payload.modelId ?? existing.modelId,
      is_iot_enabled: payload.isIotEnable ?? existing.isIotEnable,
      warranty_start_date: toDateOrNull(payload.warrantyStartDate) ?? existing.warrantyStartDate ?? null,
      warranty_end_date: toDateOrNull(payload.warrantyEndDate) ?? existing.warrantyEndDate ?? null,
      year_of_production: payload.yearOfProduction ?? existing.yearOfProduction ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return findById(id);
}

export async function updateIotEnable(id: number, isIotEnable: boolean): Promise<HealthcareFacilityAsset | null> {
  const existing = await findById(id);
  if (!existing) return null;

  await db
    .updateTable("healthcare_facility_asset")
    .set({ updated_at: new Date(), is_iot_enabled: isIotEnable })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return findById(id);
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await db
    .selectFrom("healthcare_facility_asset")
    .select("id")
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (!existing) return false;

  await db
    .updateTable("healthcare_facility_asset")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
