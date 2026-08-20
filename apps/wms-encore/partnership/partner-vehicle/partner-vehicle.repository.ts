// ---------------------------------------------------------------------------
// Table: partner_vehicle
// (mirrors apps/wms-service's infrastructure/database/models/PartnerVehicleModel.ts,
// Sequelize `paranoid: true` soft-delete convention)
//
//   id                integer unsigned, auto-increment, primary key
//   created_by        varchar(36)             not null
//   updated_by        varchar(36)             not null
//   entity_id         bigint unsigned         not null
//   vehicle_type      enum(                   not null
//                       'BOX_TRUCK','REFRIGERATED_BOX_TRUCK','OPEN_BODY_TRUCK',
//                       'TANKER','HAZARDOUS_MATERIAL_TRUCK',
//                       'RADIOACTIVE_MATERIAL_TRUCK','FLATBED_TRUCK',
//                       'LOADER_TRUCK','TRAILER','VAN'
//                     )
//   vehicle_number    varchar(16)             not null, unique ("Unique Vehicle Number")
//   capacity_in_kgs   integer                 not null, default 1
//   transporter_id    bigint unsigned         null
//   created_at        timestamp               not null
//   updated_at        timestamp               null
//   deleted_at        timestamp               null   (paranoid soft-delete)
//   deleted_by        bigint                  null
//
// Indexes: PRIMARY (id), unique "Unique Vehicle Number" (vehicle_number)
// ---------------------------------------------------------------------------

import { db } from "../db";
import { sql } from "kysely";
import { getEntityId } from "../../entity/entities/entities.repository";
import type { PartnerVehicle, PaginatedPartnerVehicles } from "./partner-vehicle.types";

type VehicleType = PartnerVehicle["vehicleType"];

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
  entity_id: number;
  vehicle_type: VehicleType;
  vehicle_number: string;
  capacity_in_kgs: number;
  transporter_id: number | null;
}): PartnerVehicle {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    entityId: row.entity_id,
    vehicleType: row.vehicle_type,
    vehicleNumber: row.vehicle_number,
    capacityInKgs: row.capacity_in_kgs,
    transporterId: row.transporter_id ?? undefined,
  };
}

// Mirrors getPartnerVehicleById()'s entityName enrichment (getEntityDetail
// against apps/core in the original, whose primary path is a plain lookup of
// this same DB's `entities` table by primary key — see
// partnership-operator-map.repository.ts's header comment for the general
// rationale). Ported as a local join via entities.repository's getEntityId.
export async function findById(id: number): Promise<PartnerVehicle | null> {
  const row = await db
    .selectFrom("partner_vehicle")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  if (!row) return null;
  const entity = toEntity(row);
  const entityDetail = await getEntityId(row.entity_id);
  entity.entityName = entityDetail?.name ?? undefined;
  return entity;
}

export async function findByVehicleNumber(
  vehicleNumber: string,
  transporterId: number,
  healthcareFacilityId?: number,
): Promise<PartnerVehicle | null> {
  let query = db
    .selectFrom("partner_vehicle")
    .selectAll()
    .where("vehicle_number", "=", vehicleNumber)
    .where("transporter_id", "=", transporterId)
    .where("deleted_at", "is", null);
  if (healthcareFacilityId) {
    query = query.where("entity_id", "=", healthcareFacilityId);
  }
  const row = await query.executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  // when set, filters by entity_id (hospital-tagged callers) instead of transporter_id
  entityIdFilter?: number;
  transporterIdFilter?: number;
  healthcareFacilityId?: number;
  providerId?: number;
}): Promise<PaginatedPartnerVehicles> {
  let query = db.selectFrom("partner_vehicle").where("deleted_at", "is", null);

  if (params.entityIdFilter !== undefined) {
    query = query.where("entity_id", "=", params.entityIdFilter);
  }
  if (params.transporterIdFilter !== undefined) {
    query = query.where("transporter_id", "=", params.transporterIdFilter);
  }
  if (params.healthcareFacilityId) {
    query = query.where("entity_id", "=", params.healthcareFacilityId);
  }
  if (params.providerId) {
    query = query.where("transporter_id", "=", params.providerId);
  }
  if (params.search) {
    const search = params.search;
    // vehicle_type is a real Postgres enum column — cast to text for an ILIKE
    // match, since Kysely (correctly) won't allow a pattern match against a
    // typed enum otherwise. ilike (not like) for case-insensitive search, the
    // Postgres-native equivalent of the original's MySQL default collation.
    query = query.where((eb) =>
      eb.or([
        eb("vehicle_number", "ilike", `%${search}%`),
        sql<boolean>`vehicle_type::text ilike ${`%${search}%`}`,
      ]),
    );
  }

  const countRow = await query
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  // Mirrors getAllPartnerVehicles()'s per-row entityName enrichment
  // (getEntityDetail) — see findById's comment above for why this is a local
  // join against `entities` rather than an HTTP call.
  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      const entityDetail = await getEntityId(row.entity_id);
      entity.entityName = entityDetail?.name ?? undefined;
      return entity;
    }),
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
  entityId: number;
  vehicleType: VehicleType;
  vehicleNumber: string;
  capacityInKgs: number;
  transporterId?: number;
}): Promise<PartnerVehicle> {
  const row = await db
    .insertInto("partner_vehicle")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      entity_id: payload.entityId,
      vehicle_type: payload.vehicleType,
      vehicle_number: payload.vehicleNumber,
      capacity_in_kgs: payload.capacityInKgs,
      transporter_id: payload.transporterId ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function createMany(
  payloads: Array<{
    createdBy: string;
    entityId: number;
    vehicleType: VehicleType;
    vehicleNumber: string;
    capacityInKgs: number;
    transporterId?: number;
  }>,
): Promise<void> {
  if (!payloads.length) return;
  await db
    .insertInto("partner_vehicle")
    .values(
      payloads.map((payload) => ({
        created_by: payload.createdBy,
        updated_by: payload.createdBy,
        entity_id: payload.entityId,
        vehicle_type: payload.vehicleType,
        vehicle_number: payload.vehicleNumber,
        capacity_in_kgs: payload.capacityInKgs,
        transporter_id: payload.transporterId ?? null,
      })),
    )
    .execute();
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    entityId: number;
    vehicleType: VehicleType;
    vehicleNumber: string;
    capacityInKgs: number;
  },
): Promise<PartnerVehicle | null> {
  const row = await db
    .updateTable("partner_vehicle")
    .set({
      updated_by: payload.updatedBy,
      updated_at: new Date(),
      entity_id: payload.entityId,
      vehicle_type: payload.vehicleType,
      vehicle_number: payload.vehicleNumber,
      capacity_in_kgs: payload.capacityInKgs,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const row = await db
    .updateTable("partner_vehicle")
    .set({
      deleted_at: new Date(),
      deleted_by: deletedBy ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return Boolean(row);
}

// Mirrors deletePartnerVehicle()'s guard: refuses to delete a vehicle
// referenced by any (non-soft-deleted) waste_transportation_external_group
// row (WasteTransportationExternalGroupModel.findOne({ where:
// { transporterVehicleId: id } }) in the original — Sequelize's `paranoid`
// convention excludes soft-deleted rows by default, reproduced here via the
// explicit deleted_at IS NULL filter). This table belongs to the waste/
// domain but is read-only here (see the migration task's read-only carve-out)
// and the column now exists in this port's shared db.ts (waste_transportation
// _external_group.transporter_vehicle_id) — the original TODO deferring this
// no longer applies.
export async function findExternalGroupUsage(vehicleId: number): Promise<boolean> {
  const row = await db
    .selectFrom("waste_transportation_external_group")
    .select("id")
    .where("transporter_vehicle_id", "=", vehicleId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return Boolean(row);
}
