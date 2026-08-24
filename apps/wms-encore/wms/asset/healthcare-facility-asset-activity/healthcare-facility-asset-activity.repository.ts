// Postgres columns for table `healthcare_facility_asset_activity` (mirrors
// infrastructure/database/models/HealthcareFacilityAssetActivityModel.ts
// field-for-field). No `updated_at` column exists (timestamps: true but
// updatedAt: false in the original model).
//
//   id            integer, auto-increment, primary key (implicit Sequelize default —
//                 not declared in the original model's init() block)
//   created_by    varchar(36), not null
//   created_at    timestamp, not null
//   hf_asset_id   integer, not null — FK to `healthcare_facility_asset.id`
//                 (owned by the sibling healthcare-facility-asset module,
//                 being ported in parallel; not touched here)
//   operator_id   varchar(36), nullable (model says allowNull: true, though the
//                 DTO/request schema requires it — original model/schema mismatch,
//                 preserved as-is)
//   activity_type varchar — ENUM('MAINTENANCE', 'CALIBRATION') in Postgres, nullable
//                 (model says allowNull: true, though the DTO/request schema
//                 requires it — same mismatch as operator_id)
//   start_date    timestamp, not null
//   end_date      timestamp, nullable
//   deleted_at    timestamp, nullable (paranoid soft-delete)
//   deleted_by    bigint, nullable

import { db } from "../db";
import type { HealthcareFacilityAssetActivityTable } from "../../../db/db";
import type { HealthcareFacilityAssetActivity, PaginationMeta } from "./healthcare-facility-asset-activity.types";

// Zod already validates activityType against the enum before this is called —
// same pattern as asset-model.repository.ts's toAssetType.
function toActivityType(value: string): HealthcareFacilityAssetActivityTable["activity_type"] {
  return value as HealthcareFacilityAssetActivityTable["activity_type"];
}

function toEntity(row: {
  created_by: string;
  activity_type: string | null;
  hf_asset_id: number;
  operator_id: string | null;
  created_at: Date;
  start_date: Date;
  end_date: Date | null;
}): HealthcareFacilityAssetActivity {
  return {
    createdBy: row.created_by,
    activityType: row.activity_type ?? "",
    hfAssetId: row.hf_asset_id,
    operatorId: row.operator_id ?? "",
    createdAt: row.created_at,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
  };
}

// Cross-module existence check equivalent to the original use-case's call to
// HealthcareFacilityAssetRepository.getHealthcareFacilityAssetById(hfAssetId)
// (owned by the sibling healthcare-facility-asset module, ported in
// parallel). Queried directly here rather than importing that module's
// repository, since it isn't guaranteed to exist yet.
export async function hfAssetExists(hfAssetId: number): Promise<boolean> {
  const row = await db
    .selectFrom("healthcare_facility_asset")
    .select("id")
    .where("id", "=", hfAssetId)
    .executeTakeFirst();
  return !!row;
}

export async function create(payload: {
  createdBy: string;
  activityType: string;
  hfAssetId: number;
  operatorId: string;
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
}): Promise<void> {
  await db
    .insertInto("healthcare_facility_asset_activity")
    .values({
      created_by: payload.createdBy,
      created_at: payload.createdAt,
      hf_asset_id: payload.hfAssetId,
      operator_id: payload.operatorId,
      activity_type: toActivityType(payload.activityType),
      start_date: payload.startDate,
      end_date: payload.endDate ?? null,
    })
    .execute();
}

export async function findAllPaginated(params: {
  limit: number;
  page: number;
  activityType?: string;
  hfAssetId?: number;
}): Promise<{ data: HealthcareFacilityAssetActivity[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("healthcare_facility_asset_activity").where("deleted_at", "is", null);
  if (params.hfAssetId) {
    query = query.where("hf_asset_id", "=", params.hfAssetId);
  }
  if (params.activityType) {
    query = query.where("activity_type", "=", toActivityType(params.activityType));
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .select(["created_by", "created_at", "activity_type", "operator_id", "hf_asset_id", "start_date", "end_date"])
    .orderBy("created_at", "desc")
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
