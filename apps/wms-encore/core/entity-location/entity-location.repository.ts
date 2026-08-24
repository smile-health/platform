import { db } from "../db-wms";
import type { EntityLocation, PaginatedEntityLocations } from "./entity-location.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
  entity_id: number;
  location_name: string;
  latitude: number;
  longitude: number;
  distance_limit_in_meters: number | null;
  address: string | null;
  province_id: number | null;
  city_id: number | null;
  province_name: string | null;
  city_name: string | null;
  location_type: "STORAGE" | "TREATMENT";
}): EntityLocation {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    entityId: row.entity_id,
    locationName: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    distanceLimitInMeters: row.distance_limit_in_meters ?? undefined,
    address: row.address ?? undefined,
    provinceId: row.province_id ?? undefined,
    cityId: row.city_id ?? undefined,
    provinceName: row.province_name ?? undefined,
    cityName: row.city_name ?? undefined,
    locationType: row.location_type,
  };
}

export async function findById(id: number): Promise<EntityLocation | null> {
  const row = await db
    .selectFrom("entity_location")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findByEntityId(entityId: string): Promise<EntityLocation[]> {
  const rows = await db
    .selectFrom("entity_location")
    .selectAll()
    .where("entity_id", "=", Number(entityId))
    .where("deleted_at", "is", null)
    .execute();
  return rows.map(toEntity);
}

// NOTE: original getAllEntityLocationsPartnership() additionally widens the
// entityId filter to every TRANSPORTER-role partner of `entityId` via
// InfraRegistry.partnershipRepositoryImpl (a cross-domain, in-process
// singleton lookup that doesn't have an Encore equivalent wired yet). That
// join is intentionally out of scope for this port — see service.ts comment.
export async function findByEntityIds(entityIds: string[]): Promise<EntityLocation[]> {
  const rows = await db
    .selectFrom("entity_location")
    .selectAll()
    .where("entity_id", "in", entityIds.map(Number))
    .where("deleted_at", "is", null)
    .execute();
  return rows.map(toEntity);
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  entityId?: string;
  locationType?: "STORAGE" | "TREATMENT";
}): Promise<PaginatedEntityLocations> {
  let query = db.selectFrom("entity_location").where("deleted_at", "is", null);
  if (params.entityId) query = query.where("entity_id", "=", Number(params.entityId));
  if (params.locationType) query = query.where("location_type", "=", params.locationType);
  if (params.search) query = query.where("location_name", "ilike", `%${params.search}%`);

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
  entityId: number;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters?: number;
  address?: string;
  provinceId?: number;
  cityId?: number;
  provinceName?: string;
  cityName?: string;
  locationType: "STORAGE" | "TREATMENT";
}): Promise<EntityLocation> {
  const row = await db
    .insertInto("entity_location")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      entity_id: payload.entityId,
      location_name: payload.locationName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      distance_limit_in_meters: payload.distanceLimitInMeters ?? null,
      address: payload.address ?? null,
      province_id: payload.provinceId ?? null,
      city_id: payload.cityId ?? null,
      province_name: payload.provinceName ?? null,
      city_name: payload.cityName ?? null,
      location_type: payload.locationType,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function existsForEntity(entityId: number): Promise<boolean> {
  const row = await db
    .selectFrom("entity_location")
    .select("id")
    .where("entity_id", "=", entityId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return Boolean(row);
}

export async function update(
  id: number,
  payload: {
    updatedBy: string;
    entityId: number;
    locationName: string;
    latitude: number;
    longitude: number;
    distanceLimitInMeters?: number;
    address?: string;
    provinceId?: number;
    cityId?: number;
    provinceName?: string;
    cityName?: string;
  },
): Promise<EntityLocation | null> {
  const row = await db
    .updateTable("entity_location")
    .set({
      updated_by: payload.updatedBy,
      updated_at: new Date(),
      entity_id: payload.entityId,
      location_name: payload.locationName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      distance_limit_in_meters: payload.distanceLimitInMeters ?? null,
      address: payload.address ?? null,
      province_id: payload.provinceId ?? null,
      city_id: payload.cityId ?? null,
      province_name: payload.provinceName ?? null,
      city_name: payload.cityName ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const row = await db
    .updateTable("entity_location")
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

export async function validateDistanceLimit(
  id: number,
  longitude: number,
  latitude: number,
): Promise<{ result: boolean; distance: number } | null> {
  const row = await db
    .selectFrom("entity_location")
    .select(["latitude", "longitude", "distance_limit_in_meters"])
    .where("id", "=", id)
    .executeTakeFirst();
  if (!row) return null;

  const distance = calculateDistance(row.latitude, row.longitude, latitude, longitude);
  const distanceLimit = row.distance_limit_in_meters ?? 0;

  return {
    result: distance === 0 || distance <= distanceLimit,
    distance,
  };
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
