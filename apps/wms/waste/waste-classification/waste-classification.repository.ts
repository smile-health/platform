// Postgres columns for table `waste_classification` (mirrors
// infrastructure/database/models/WasteClassificationModel.ts field-for-field):
//
//   id                                  integer, unsigned, auto-increment, primary key
//   created_by                         varchar(36), not null
//   updated_by                         varchar(36), not null
//   region_id                          integer, not null
//   effective_from                     timestamp, not null
//   effective_to                       timestamp, not null
//   waste_type_id                      integer, not null (FK -> waste_hierarchy.id)
//   waste_group_id                     integer, not null (FK -> waste_hierarchy.id)
//   waste_characteristics_id           integer, not null (FK -> waste_hierarchy.id)
//   waste_code                         varchar(64), not null
//   waste_bag_color_code               enum('BLACK','GRAY','YELLOW','PURPLE','BROWN','RED','NONE'), not null
//   storage_rule_type                  enum('STATIC','RULE_BASED'), nullable
//   use_cold_storage                   boolean, not null, default false
//   cold_storage_min_hours             integer, nullable
//   cold_storage_max_hours             integer, nullable
//   temp_storage_min_hours             integer, nullable
//   temp_storage_max_hours             integer, nullable
//   minimun_decay_day                  integer, nullable (typo preserved verbatim from the original column name)
//   storage_rule                       json, nullable
//   allow_healthcare_facility_treatment boolean, not null, default true
//   is_active                          boolean, not null, default true
//   has_multiple_transporters          boolean, not null, default false
//   treatment_method                   varchar(255), nullable
//   disposal_method                    varchar(255), nullable
//   allowed_vehicle_types              varchar(255), nullable
//   created_at                         timestamp, not null
//   updated_at                         timestamp, nullable
//   deleted_at                         timestamp, nullable (paranoid soft-delete)
//   deleted_by                         bigint, nullable
//
// Joined table `waste_hierarchy` (a sibling module being built in parallel —
// not registered in Kysely's schema yet either, so these joins error the
// same way as the waste_classification table itself). Joined three times, by
// waste_type_id / waste_group_id / waste_characteristics_id respectively,
// aliased waste_type / waste_group / waste_characteristics below. Columns
// read (mirrors the original's per-relation `attributes` list):
//
//   id                bigint, unsigned, auto-increment, primary key
//   region_id         integer, unsigned, not null
//   name               varchar(64), not null
//   name_en            varchar(64), not null
//   description        varchar(255), nullable
//   description_en     varchar(255), nullable
//   parent_hierarchy_id bigint, unsigned, nullable
//   is_residue         boolean, nullable (only selected on the
//                      waste_characteristics join, mirrors the original)
//   is_active          boolean, nullable — the waste_characteristics
//                      association additionally carries a Sequelize `scope:
//                      { is_active: 1 }` on the belongsTo definition, applied
//                      as an extra join-ON condition here (not a global
//                      WHERE, since the relation is `required: false`).
//   deleted_at         timestamp, nullable (paranoid soft-delete) — the
//                      original's paranoid model applies this filter to
//                      includes too, so all three joins below also filter
//                      deleted_at IS NULL.
//
// `regions` (already registered — see db/db.ts's RegionsTable) is queried by
// getOneRegionId() below to mirror RegionRepositoryImpl.getOneRegion(), which
// CreateWasteClassification falls back to when the request omits regionId:
// it just grabs whatever single row `checkExistingOneData(RegionModel)`
// happens to return (no explicit ordering in the original — ported as-is,
// picking the lowest id for determinism).
//
// NOTE on the original's "delete": DeleteWasteClassification only flips
// `is_active` to false — it does NOT set `deleted_at` (unlike most other
// paranoid models in this codebase, whose delete use-cases actually
// soft-delete). softDelete() below mirrors that exactly: it does not touch
// deleted_at, only is_active.

import { db } from "../../db/db";
import type { PaginationMeta, WasteClassification, WasteHierarchySummary } from "./waste-classification.types";

// Zod already validates these against their enums before this is called (see
// waste-classification.schema.ts) — these casts just tell Kysely the wire
// string is one of the enum's members, matching asset-model.repository.ts's
// `toAssetType` pattern.
type WasteBagColorCode = "BLACK" | "GRAY" | "YELLOW" | "PURPLE" | "BROWN" | "RED" | "NONE";
type StorageRuleType = "STATIC" | "RULE_BASED";

function toWasteBagColorCode(value: string): WasteBagColorCode {
  return value as WasteBagColorCode;
}

function toStorageRuleType(value: string | undefined): StorageRuleType | null {
  return (value as StorageRuleType | undefined) ?? null;
}

interface WasteClassificationRow {
  id: number;
  created_by: string;
  updated_by: string;
  region_id: number;
  effective_from: Date;
  effective_to: Date;
  waste_type_id: number;
  waste_group_id: number;
  waste_characteristics_id: number;
  waste_code: string;
  waste_bag_color_code: string;
  storage_rule_type: string | null;
  use_cold_storage: boolean;
  cold_storage_min_hours: number | null;
  cold_storage_max_hours: number | null;
  temp_storage_min_hours: number | null;
  temp_storage_max_hours: number | null;
  minimun_decay_day: number | null;
  storage_rule: string | null;
  allow_healthcare_facility_treatment: boolean;
  is_active: boolean;
  has_multiple_transporters: boolean;
  treatment_method: string | null;
  disposal_method: string | null;
  allowed_vehicle_types: string | null;
  created_at: Date;
  updated_at: Date | null;
}

interface WasteHierarchyJoinRow {
  waste_type_id?: number | null;
  waste_type_name?: string | null;
  waste_type_name_en?: string | null;
  waste_type_region_id?: number | null;
  waste_type_description?: string | null;
  waste_type_description_en?: string | null;
  waste_type_parent_hierarchy_id?: number | null;
  waste_group_id_join?: number | null;
  waste_group_name?: string | null;
  waste_group_name_en?: string | null;
  waste_group_region_id?: number | null;
  waste_group_description?: string | null;
  waste_group_description_en?: string | null;
  waste_group_parent_hierarchy_id?: number | null;
  waste_characteristics_id_join?: number | null;
  waste_characteristics_name?: string | null;
  waste_characteristics_name_en?: string | null;
  waste_characteristics_region_id?: number | null;
  waste_characteristics_description?: string | null;
  waste_characteristics_description_en?: string | null;
  waste_characteristics_parent_hierarchy_id?: number | null;
  waste_characteristics_is_residue?: boolean | null;
}

function toEntity(row: WasteClassificationRow & Partial<WasteHierarchyJoinRow>): WasteClassification {
  const wasteType: WasteHierarchySummary | undefined =
    row.waste_type_name != null
      ? {
          id: row.waste_type_id!,
          name: row.waste_type_name,
          nameEn: row.waste_type_name_en ?? "",
          regionId: row.waste_type_region_id ?? undefined,
          description: row.waste_type_description ?? undefined,
          descriptionEn: row.waste_type_description_en ?? undefined,
          parentHierarchyId: row.waste_type_parent_hierarchy_id ?? null,
        }
      : undefined;

  const wasteGroup: WasteHierarchySummary | undefined =
    row.waste_group_name != null
      ? {
          id: row.waste_group_id_join!,
          name: row.waste_group_name,
          nameEn: row.waste_group_name_en ?? "",
          regionId: row.waste_group_region_id ?? undefined,
          description: row.waste_group_description ?? undefined,
          descriptionEn: row.waste_group_description_en ?? undefined,
          parentHierarchyId: row.waste_group_parent_hierarchy_id ?? null,
        }
      : undefined;

  const wasteCharacteristics: WasteHierarchySummary | undefined =
    row.waste_characteristics_name != null
      ? {
          id: row.waste_characteristics_id_join!,
          name: row.waste_characteristics_name,
          nameEn: row.waste_characteristics_name_en ?? "",
          regionId: row.waste_characteristics_region_id ?? undefined,
          description: row.waste_characteristics_description ?? undefined,
          descriptionEn: row.waste_characteristics_description_en ?? undefined,
          parentHierarchyId: row.waste_characteristics_parent_hierarchy_id ?? null,
          isResidue: row.waste_characteristics_is_residue ?? undefined,
        }
      : undefined;

  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    regionId: row.region_id,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    wasteTypeId: row.waste_type_id,
    wasteGroupId: row.waste_group_id,
    wasteCharacteristicsId: row.waste_characteristics_id,
    wasteCode: row.waste_code,
    wasteBagColorCode: row.waste_bag_color_code,
    storageRuleType: row.storage_rule_type ?? undefined,
    useColdStorage: row.use_cold_storage,
    coldStorageMinHours: row.cold_storage_min_hours ?? undefined,
    coldStorageMaxHours: row.cold_storage_max_hours ?? undefined,
    tempStorageMinHours: row.temp_storage_min_hours ?? undefined,
    tempStorageMaxHours: row.temp_storage_max_hours ?? undefined,
    minimunDecayDay: row.minimun_decay_day ?? undefined,
    storageRule: row.storage_rule ?? undefined,
    allowHealthcareFacilityTreatment: row.allow_healthcare_facility_treatment,
    isActive: row.is_active,
    hasMultipleTransporters: row.has_multiple_transporters,
    treatmentMethod: row.treatment_method,
    disposalMethod: row.disposal_method ?? undefined,
    allowedVehicleTypes: row.allowed_vehicle_types,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    wasteType,
    wasteGroup,
    wasteCharacteristics,
  };
}

// Mirrors getWasteClassificationById's three belongsTo includes (all
// required: false / left join), plus the waste_characteristics association's
// `scope: { is_active: 1 }` applied as an extra ON condition, and the
// paranoid deleted_at filter the original applies to every included model.
function baseSelectWithHierarchy() {
  return db
    .selectFrom("waste_classification")
    .leftJoin(
      "waste_hierarchy as waste_type",
      (join) =>
        join
          .onRef("waste_type.id", "=", "waste_classification.waste_type_id")
          .on("waste_type.deleted_at", "is", null) as any
    )
    .leftJoin(
      "waste_hierarchy as waste_group",
      (join) =>
        join
          .onRef("waste_group.id", "=", "waste_classification.waste_group_id")
          .on("waste_group.deleted_at", "is", null) as any
    )
    .leftJoin(
      "waste_hierarchy as waste_characteristics",
      (join) =>
        join
          .onRef("waste_characteristics.id", "=", "waste_classification.waste_characteristics_id")
          .on("waste_characteristics.deleted_at", "is", null)
          .on("waste_characteristics.is_active", "=", true) as any
    )
    .select([
      "waste_classification.id",
      "waste_classification.created_by",
      "waste_classification.updated_by",
      "waste_classification.region_id",
      "waste_classification.effective_from",
      "waste_classification.effective_to",
      "waste_classification.waste_type_id",
      "waste_classification.waste_group_id",
      "waste_classification.waste_characteristics_id",
      "waste_classification.waste_code",
      "waste_classification.waste_bag_color_code",
      "waste_classification.storage_rule_type",
      "waste_classification.use_cold_storage",
      "waste_classification.cold_storage_min_hours",
      "waste_classification.cold_storage_max_hours",
      "waste_classification.temp_storage_min_hours",
      "waste_classification.temp_storage_max_hours",
      "waste_classification.minimun_decay_day",
      "waste_classification.storage_rule",
      "waste_classification.allow_healthcare_facility_treatment",
      "waste_classification.is_active",
      "waste_classification.has_multiple_transporters",
      "waste_classification.treatment_method",
      "waste_classification.disposal_method",
      "waste_classification.allowed_vehicle_types",
      "waste_classification.created_at",
      "waste_classification.updated_at",
      "waste_type.name as waste_type_name",
      "waste_type.name_en as waste_type_name_en",
      "waste_type.region_id as waste_type_region_id",
      "waste_type.description as waste_type_description",
      "waste_type.description_en as waste_type_description_en",
      "waste_type.parent_hierarchy_id as waste_type_parent_hierarchy_id",
      "waste_group.id as waste_group_id_join",
      "waste_group.name as waste_group_name",
      "waste_group.name_en as waste_group_name_en",
      "waste_group.region_id as waste_group_region_id",
      "waste_group.description as waste_group_description",
      "waste_group.description_en as waste_group_description_en",
      "waste_group.parent_hierarchy_id as waste_group_parent_hierarchy_id",
      "waste_characteristics.id as waste_characteristics_id_join",
      "waste_characteristics.name as waste_characteristics_name",
      "waste_characteristics.name_en as waste_characteristics_name_en",
      "waste_characteristics.region_id as waste_characteristics_region_id",
      "waste_characteristics.description as waste_characteristics_description",
      "waste_characteristics.description_en as waste_characteristics_description_en",
      "waste_characteristics.parent_hierarchy_id as waste_characteristics_parent_hierarchy_id",
      "waste_characteristics.is_residue as waste_characteristics_is_residue",
    ]) as any;
}

export async function findById(id: number): Promise<WasteClassification | null> {
  const row = await baseSelectWithHierarchy()
    .where("waste_classification.id", "=", id)
    .where("waste_classification.deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors findWasteClassificationByCondition({ wasteCharacteristicsId, id:
// { [Op.notIn]: [id] } }) used by both create (no id exclusion) and update
// (excludes the row being updated) to enforce "one classification per waste
// characteristic".
export async function findByWasteCharacteristicsId(
  wasteCharacteristicsId: number,
  excludeId?: number
): Promise<WasteClassification | null> {
  let query = db
    .selectFrom("waste_classification")
    .selectAll()
    .where("waste_characteristics_id", "=", wasteCharacteristicsId)
    .where("deleted_at", "is", null);
  if (excludeId !== undefined) {
    query = query.where("id", "!=", excludeId);
  }
  const row = await query.executeTakeFirst();
  return row ? toEntity(row as WasteClassificationRow) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  wasteCode?: string;
  useColdStorage?: boolean;
  updatedAt?: string;
  sortBy?: "wasteCode" | "useColdStorage" | "updatedAt" | "updated_at";
  sortOrder?: "ASC" | "DESC";
}): Promise<{ data: WasteClassification[]; pagination: PaginationMeta }> {
  const sortOrder = params.sortOrder === "DESC" ? "desc" : "asc";

  function applyFilters<T extends { where: (...args: any[]) => T }>(query: T): T {
    let q = query;
    if (params.wasteCode) {
      q = q.where("waste_classification.waste_code" as any, "ilike", `%${params.wasteCode}%`);
    }
    if (typeof params.useColdStorage === "boolean") {
      q = q.where("waste_classification.use_cold_storage" as any, "=", params.useColdStorage);
    }
    if (params.updatedAt) {
      q = q.where("waste_classification.updated_at" as any, ">=", new Date(params.updatedAt));
    }
    if (params.wasteTypeId) {
      q = q.where("waste_classification.waste_type_id" as any, "=", params.wasteTypeId);
    }
    if (params.wasteGroupId) {
      q = q.where("waste_classification.waste_group_id" as any, "=", params.wasteGroupId);
    }
    if (params.wasteCharacteristicsId) {
      q = q.where("waste_classification.waste_characteristics_id" as any, "=", params.wasteCharacteristicsId);
    }
    if (params.search) {
      const term = `%${params.search}%`;
      q = q.where((eb: any) =>
        eb.or([
          eb("waste_classification.waste_code", "ilike", term),
          eb("waste_type.name", "ilike", term),
          eb("waste_type.description", "ilike", term),
          eb("waste_group.name", "ilike", term),
          eb("waste_group.description", "ilike", term),
          eb("waste_characteristics.name", "ilike", term),
          eb("waste_characteristics.description", "ilike", term),
        ])
      );
    }
    return q;
  }

  let countQuery: any = applyFilters(
    db
      .selectFrom("waste_classification")
      .leftJoin("waste_hierarchy as waste_type", (join) =>
        join.onRef("waste_type.id", "=", "waste_classification.waste_type_id")
      )
      .leftJoin("waste_hierarchy as waste_group", (join) =>
        join.onRef("waste_group.id", "=", "waste_classification.waste_group_id")
      )
      .leftJoin("waste_hierarchy as waste_characteristics", (join) =>
        join.onRef("waste_characteristics.id", "=", "waste_classification.waste_characteristics_id")
      )
      .where("waste_classification.deleted_at", "is", null) as any
  );
  const countRow = await countQuery
    .select((eb: any) => eb.fn.count("waste_classification.id").distinct().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  let listQuery: any = applyFilters(
    baseSelectWithHierarchy().where("waste_classification.deleted_at", "is", null) as any
  );

  // Mirrors the original's sort switch: wasteCode/useColdStorage sort by
  // their own column, everything else (including the bare updated_at/updatedAt
  // values) falls back to updated_at; a secondary updated_at DESC tiebreaker
  // is added whenever the primary sort isn't already updated_at.
  switch (params.sortBy) {
    case "wasteCode":
      listQuery = listQuery.orderBy("waste_classification.waste_code", sortOrder);
      listQuery = listQuery.orderBy("waste_classification.updated_at", "desc");
      break;
    case "useColdStorage":
      listQuery = listQuery.orderBy("waste_classification.use_cold_storage", sortOrder);
      listQuery = listQuery.orderBy("waste_classification.updated_at", "desc");
      break;
    default:
      listQuery = listQuery.orderBy("waste_classification.updated_at", sortOrder);
      break;
  }

  const rows = await listQuery
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map((row: any) => toEntity(row)),
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
  regionId: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType?: string;
  useColdStorage: boolean;
  coldStorageMinHours?: number;
  coldStorageMaxHours?: number;
  tempStorageMinHours?: number;
  tempStorageMaxHours?: number;
  minimunDecayDay?: number;
  storageRule?: string;
  allowHealthcareFacilityTreatment: boolean;
  isActive: boolean;
  hasMultipleTransporters: boolean;
  treatmentMethod?: string;
  disposalMethod: string;
  allowedVehicleTypes?: string;
}): Promise<WasteClassification> {
  // Mirrors the original: updated_by set to createdBy on create, not a
  // separately-supplied value (there isn't one at creation time).
  const row = await db
    .insertInto("waste_classification")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      region_id: payload.regionId,
      effective_from: payload.effectiveFrom,
      effective_to: payload.effectiveTo,
      waste_type_id: payload.wasteTypeId,
      waste_group_id: payload.wasteGroupId,
      waste_characteristics_id: payload.wasteCharacteristicsId,
      waste_code: payload.wasteCode,
      waste_bag_color_code: toWasteBagColorCode(payload.wasteBagColorCode),
      storage_rule_type: toStorageRuleType(payload.storageRuleType),
      use_cold_storage: payload.useColdStorage,
      cold_storage_min_hours: payload.coldStorageMinHours ?? null,
      cold_storage_max_hours: payload.coldStorageMaxHours ?? null,
      temp_storage_min_hours: payload.tempStorageMinHours ?? null,
      temp_storage_max_hours: payload.tempStorageMaxHours ?? null,
      minimun_decay_day: payload.minimunDecayDay ?? null,
      storage_rule: payload.storageRule ?? null,
      allow_healthcare_facility_treatment: payload.allowHealthcareFacilityTreatment,
      is_active: payload.isActive,
      has_multiple_transporters: payload.hasMultipleTransporters,
      treatment_method: payload.treatmentMethod ?? null,
      disposal_method: payload.disposalMethod,
      allowed_vehicle_types: payload.allowedVehicleTypes ?? null,
    } as any)
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row as WasteClassificationRow);
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    regionId?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date;
    wasteTypeId: number;
    wasteGroupId: number;
    wasteCharacteristicsId: number;
    wasteCode: string;
    wasteBagColorCode: string;
    storageRuleType?: string;
    useColdStorage: boolean;
    coldStorageMinHours?: number;
    coldStorageMaxHours?: number;
    tempStorageMinHours?: number;
    tempStorageMaxHours?: number;
    minimunDecayDay?: number;
    storageRule?: string;
    hasMultipleTransporters: boolean;
    allowHealthcareFacilityTreatment: boolean;
    // Original always sets treatmentMethod to `treatmentMethod ?? null`,
    // i.e. it does NOT fall back to the existing row's value — a request
    // that omits treatmentMethod clears it. Preserved verbatim.
    treatmentMethod?: string;
    disposalMethod: string;
    // Same as treatmentMethod: original always resolves to `?? null`,
    // clearing the field when omitted rather than keeping the existing value.
    allowedVehicleTypes?: string;
  }
): Promise<WasteClassification | null> {
  const existing = await findById(id);
  if (!existing) return null;

  await db
    .updateTable("waste_classification")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      region_id: payload.regionId ?? existing.regionId,
      effective_from: payload.effectiveFrom ?? existing.effectiveFrom,
      effective_to: payload.effectiveTo ?? existing.effectiveTo,
      waste_type_id: payload.wasteTypeId,
      waste_group_id: payload.wasteGroupId,
      waste_characteristics_id: payload.wasteCharacteristicsId,
      waste_code: payload.wasteCode,
      waste_bag_color_code: toWasteBagColorCode(payload.wasteBagColorCode),
      storage_rule_type: toStorageRuleType(payload.storageRuleType),
      use_cold_storage: payload.useColdStorage,
      cold_storage_min_hours: payload.coldStorageMinHours ?? null,
      cold_storage_max_hours: payload.coldStorageMaxHours ?? null,
      temp_storage_min_hours: payload.tempStorageMinHours ?? null,
      temp_storage_max_hours: payload.tempStorageMaxHours ?? null,
      minimun_decay_day: payload.minimunDecayDay ?? null,
      storage_rule: payload.storageRule ?? null,
      allow_healthcare_facility_treatment: payload.allowHealthcareFacilityTreatment,
      has_multiple_transporters: payload.hasMultipleTransporters,
      treatment_method: payload.treatmentMethod ?? null,
      disposal_method: payload.disposalMethod,
      allowed_vehicle_types: payload.allowedVehicleTypes ?? null,
    } as any)
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return findById(id);
}

// Mirrors the original DeleteWasteClassification: it only flips `is_active`
// to false via WasteClassificationModel.update(..., { where: { id } }) — it
// never sets deleted_at, despite the model being paranoid. Preserved
// verbatim rather than "fixed" to a real soft-delete.
export async function deactivate(id: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .updateTable("waste_classification")
    .set({ is_active: false } as any)
    .where("id", "=", id)
    .execute();
  return true;
}

// Mirrors RegionRepositoryImpl.getOneRegion() — the original calls
// checkExistingOneData(RegionModel), which is an unordered "grab any one
// row" helper; ported deterministically as "lowest id" since Postgres makes
// no ordering guarantee without an ORDER BY.
export async function getOneRegionId(): Promise<number | null> {
  const row = await db.selectFrom("regions").select("id").orderBy("id", "asc").executeTakeFirst();
  return row?.id ?? null;
}

// Mirrors WasteHierarchyRepositoryImpl's findWasteHierarchyByCondition({ id }),
// used to validate wasteTypeId / wasteGroupId / wasteCharacteristicsId exist.
// `waste_hierarchy` isn't registered in Kysely's schema yet (sibling module
// being built in parallel) — expect a tsc error here, same as the joins above.
export async function wasteHierarchyExists(id: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_hierarchy" as any)
    .select("id" as any)
    .where("id" as any, "=", id)
    .where("deleted_at" as any, "is", null)
    .executeTakeFirst();
  return !!row;
}
