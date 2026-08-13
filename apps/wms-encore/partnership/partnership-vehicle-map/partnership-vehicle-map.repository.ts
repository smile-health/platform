// Postgres column list for `partnership_vehicle_map`, mirroring
// infrastructure/database/models/PartnershipVehicleMapModel.ts exactly
// (composite primary key, paranoid soft-delete, no created_at/updated_at):
//
//   partnership_id  bigint unsigned  not null  (PK, part 1; FK -> partnership.id)
//   vehicle_id      bigint unsigned  not null  (PK, part 2; FK -> partner_vehicle.id)
//   deleted_at      timestamp        null
//   deleted_by      bigint           null
//
// Indexes: btree on partnership_id, btree on vehicle_id (see model's `indexes`).
//
// This module's queries also join two tables belonging to sibling
// not-yet-ported domains, for integration reference:
//
//   partnership table (infrastructure/database/models/PartnershipModel.ts,
//   tableName 'partnership'): id, consumer_id (bigint unsigned), ... (only
//   `id` and `consumer_id` are read here).
//
//   partner_vehicle table (infrastructure/database/models/PartnerVehicleModel.ts,
//   tableName 'partner_vehicle'): id (int unsigned, PK), entity_id (bigint
//   unsigned), vehicle_type (enum), vehicle_number (varchar), capacity_in_kgs
//   (numeric), ... (only these four plus id are read here).

import { db } from "../../db/db";
import type {
  PaginatedPartnershipVehicleMaps,
  PartnerVehicleSummary,
  PartnershipVehicleMap,
} from "./partnership-vehicle-map.types";

function toEntity(row: {
  partnership_id: number;
  vehicle_id: number;
  vehicle_id_pv: number | null;
  entity_id: number | null;
  vehicle_type: PartnerVehicleSummary["vehicleType"] | null;
  vehicle_number: string | null;
  capacity_in_kgs: number | null;
}): PartnershipVehicleMap {
  return {
    partnershipId: row.partnership_id,
    vehicleId: row.vehicle_id,
    partnerVehicle:
      row.vehicle_id_pv != null && row.entity_id != null && row.vehicle_type != null
        ? {
            id: row.vehicle_id_pv,
            entityId: row.entity_id,
            vehicleType: row.vehicle_type,
            vehicleNumber: row.vehicle_number ?? "",
            capacityInKgs: row.capacity_in_kgs ?? 0,
          }
        : undefined,
  };
}

export async function create(partnershipId: number, vehicleId: number): Promise<void> {
  await db
    .insertInto("partnership_vehicle_map")
    .values({ partnership_id: partnershipId, vehicle_id: vehicleId })
    .execute();
}

// Mirrors the original getAllPartnershipVehicleMaps()'s required inner joins
// to `partnership` (filtered by consumer_id when `search` is a numeric
// entityId string, per the original's `Number(search)`) and `partner_vehicle`.
export async function findAllPaginated(params: {
  limit: number;
  page: number;
  search?: string;
}): Promise<PaginatedPartnershipVehicleMaps> {
  let query = db
    .selectFrom("partnership_vehicle_map")
    .innerJoin("partnership", "partnership.id", "partnership_vehicle_map.partnership_id")
    .innerJoin("partner_vehicle", "partner_vehicle.id", "partnership_vehicle_map.vehicle_id")
    .where("partnership_vehicle_map.deleted_at", "is", null);

  if (params.search) {
    query = query.where("partnership.consumer_id", "=", Number(params.search));
  }

  const countRow = await query
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .select([
      "partnership_vehicle_map.partnership_id",
      "partnership_vehicle_map.vehicle_id",
      "partner_vehicle.id as vehicle_id_pv",
      "partner_vehicle.entity_id",
      "partner_vehicle.vehicle_type",
      "partner_vehicle.vehicle_number",
      "partner_vehicle.capacity_in_kgs",
    ])
    .orderBy("partnership_vehicle_map.partnership_id", "asc")
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

export async function existsPartnership(partnershipId: number): Promise<boolean> {
  const row = await db
    .selectFrom("partnership")
    .select("id")
    .where("id", "=", partnershipId)
    .executeTakeFirst();
  return Boolean(row);
}

export async function softDelete(
  partnershipId: number,
  vehicleId: number,
  deletedBy?: number,
): Promise<boolean> {
  const row = await db
    .updateTable("partnership_vehicle_map")
    .set({
      deleted_at: new Date(),
      ...(deletedBy ? { deleted_by: deletedBy } : {}),
    })
    .where("partnership_id", "=", partnershipId)
    .where("vehicle_id", "=", vehicleId)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return Boolean(row);
}
