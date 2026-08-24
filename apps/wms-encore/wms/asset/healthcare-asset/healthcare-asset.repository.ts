// Postgres columns for table `healthcare_asset` (mirrors
// infrastructure/database/models/HealthcareAssetModel.ts field-for-field):
//
//   id                          integer, unsigned, auto-increment, primary key
//   asset_id                    varchar(64), nullable
//   asset_type_name             varchar(100), not null
//   entity_id                   integer, not null            (-> healthcareFacilityId)
//   asset_working_status_name  varchar(64), not null
//   status                      boolean, not null, default false
//   created_at                  timestamp, not null
//   updated_at                  timestamp, not null
//   deleted_at                  timestamp, nullable (paranoid soft-delete)
//   deleted_by                  bigint, nullable

import { db } from "../db";
import type { HealthcareAsset } from "./healthcare-asset.types";

function toEntity(row: {
  id: number;
  asset_id: string | null;
  asset_type_name: string;
  entity_id: number;
  asset_working_status_name: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}): HealthcareAsset {
  return {
    id: row.id,
    assetId: row.asset_id,
    assetTypeName: row.asset_type_name,
    healthcareFacilityId: row.entity_id,
    assetWorkingStatusName: row.asset_working_status_name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findById(id: number): Promise<HealthcareAsset | null> {
  const row = await db
    .selectFrom("healthcare_asset")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findByIdAndFacility(
  id: number,
  healthcareFacilityId: number
): Promise<HealthcareAsset | null> {
  const row = await db
    .selectFrom("healthcare_asset")
    .selectAll()
    .where("id", "=", id)
    .where("entity_id", "=", healthcareFacilityId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function create(payload: {
  id: number;
  assetId?: string | null;
  assetTypeName: string;
  healthcareFacilityId: number;
  assetWorkingStatusName: string;
  createdAt: Date;
  updatedAt: Date;
}): Promise<HealthcareAsset> {
  // Mirrors the original verbatim: HealthcareAssetImpl.ts:28
  // (createHealthcareAsset's createModelObj) hardcodes `status: true` on
  // create regardless of any input `status` field — the DTO/entity carries a
  // `status`, but the impl never reads it here. Confirmed against the
  // original source; preserved as-is rather than "fixed".
  const row = await db
    .insertInto("healthcare_asset")
    .values({
      id: payload.id,
      asset_id: payload.assetId ?? null,
      asset_type_name: payload.assetTypeName,
      entity_id: payload.healthcareFacilityId,
      asset_working_status_name: payload.assetWorkingStatusName,
      status: true,
      created_at: payload.createdAt,
      updated_at: payload.updatedAt,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: {
    assetId?: string | null;
    assetTypeName?: string;
    healthcareFacilityId?: number;
    assetWorkingStatusName?: string;
    status?: boolean;
    updatedAt?: Date;
  }
): Promise<HealthcareAsset | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("healthcare_asset")
    .set({
      asset_id: payload.assetId !== undefined ? payload.assetId : existing.assetId,
      asset_type_name: payload.assetTypeName ?? existing.assetTypeName,
      entity_id: payload.healthcareFacilityId ?? existing.healthcareFacilityId,
      asset_working_status_name: payload.assetWorkingStatusName ?? existing.assetWorkingStatusName,
      status: payload.status ?? existing.status,
      updated_at: payload.updatedAt ?? new Date(),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}
