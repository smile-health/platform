import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./entity-location.repository";
import { entityLocationBodySchema, locationTypeSchema } from "./entity-location.schema";
import type {
  CreateEntityLocationInput,
  EntityLocation,
  GetAllEntityLocationInput,
  PaginatedEntityLocations,
  UpdateEntityLocationInput,
} from "./entity-location.types";
import { getLocalEntityName } from "../../shared/core/entity-user-lookup";
import * as partnershipRepo from "../../partnership/partnership/partnership.repository";

// entityLocationController.ts's res.fail(...) calls are almost all called with
// no options object -> plain 400s (FailedPrecondition). The two exceptions are
// explicitly noted below where they occur (isValidationError -> 422).

export async function getEntityLocationById(id: string): Promise<EntityLocation> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  // Original also required a Bearer token here and used it to enrich the
  // result with `entityName` via a cross-service SMILE-BE lookup
  // (getEntityDetail). Encore's auth:true + Gateway already rejects
  // unauthenticated requests before the handler runs, so the manual
  // "missing-token" 422 branch is unreachable in this port and dropped.
  // entityName is populated from the local `entities` table (see
  // shared/core/entity-user-lookup.ts) rather than the HTTP fallback.
  const location = await repo.findById(numericId);
  if (!location) {
    // res.fail('EntityLocation not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "EntityLocation not found");
  }
  const entityName = await getLocalEntityName(location.entityId);
  return { ...location, entityName };
}

export async function createEntityLocation(
  input: CreateEntityLocationInput,
): Promise<EntityLocation> {
  const parsedBody = entityLocationBodySchema.safeParse(input);
  if (!parsedBody.success) {
    throw new APIError(ErrCode.InvalidArgument, parsedBody.error.issues[0]?.message ?? "Invalid request");
  }
  const parsedType = locationTypeSchema.safeParse(input.locationType);
  if (!parsedType.success) {
    throw new APIError(ErrCode.InvalidArgument, "locationType must be STORAGE or TREATMENT");
  }

  if (!input.entityTag) {
    // use-case returns the sentinel string 'ENTITY_TAG_MISSING', which the
    // controller maps via res.fail(msg, { isValidationError: true }) -> 422
    throw new APIError(ErrCode.InvalidArgument, "ENTITY_TAG_MISSING");
  }
  if (!input.entityId) {
    throw new APIError(ErrCode.InvalidArgument, "entityId is required");
  }

  const isHospital = input.entityTag.includes("hospital");
  if (isHospital) {
    const alreadyExists = await repo.existsForEntity(input.entityId);
    if (alreadyExists) {
      // repo.createEntityLocationHF returns the string 'Data already exist',
      // which the controller maps the same way -> 422
      throw new APIError(ErrCode.InvalidArgument, "Data already exist");
    }
  }

  return repo.create({
    createdBy: input.createdBy,
    entityId: input.entityId,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    distanceLimitInMeters: input.distanceLimitInMeters,
    address: input.address,
    provinceId: input.provinceId,
    cityId: input.cityId,
    provinceName: input.provinceName,
    cityName: input.cityName,
    locationType: parsedType.data,
  });
}

export async function getAllEntityLocationByEntity(input: {
  entityId?: string;
  healtcareFacilityId?: number;
  wasteClassificationId?: number;
}): Promise<EntityLocation[]> {
  // Original widens the entityId filter to include every TRANSPORTER-role
  // partner of `entityId` (via partnership.repository.ts's
  // findTransporterProviderIds, filtered by
  // healtcareFacilityId/wasteClassificationId/ACTIVE status).
  if (!input.entityId) {
    // repo returns [] for falsy entityId in the original too (Sequelize
    // `where: {}` matches everything) — but the controller's `!data` check
    // never fires for an array, even an empty one, so success is always
    // returned. Preserved: no not-found here.
    return repo.findByEntityIds([]);
  }

  const providerIds = await partnershipRepo.findTransporterProviderIds({
    transporterId: Number(input.entityId),
    healthcareFacilityId: input.healtcareFacilityId,
    wasteClassificationId: input.wasteClassificationId,
  });
  const entityIds = [input.entityId, ...providerIds.map((id) => String(id))];
  return repo.findByEntityIds(entityIds);
}

export async function getAllEntityLocation(
  input: GetAllEntityLocationInput,
): Promise<EntityLocation[] | PaginatedEntityLocations> {
  if (input.isSuperAdmin && !input.locationType) {
    // Original: `throw new Error('locationType are required.')` — this is a
    // plain, un-flagged Error, uncaught by the use-case's own try/catch (it's
    // thrown before the use-case is even called), so it propagates to the
    // controller's outer catch -> res.error(...) -> 500 "error" envelope, NOT
    // a res.fail(...) 400. A plain Error (not APIError) preserves that.
    throw new Error("locationType are required.");
  }

  if (input.isSuperAdmin) {
    const parsedType = locationTypeSchema.safeParse(input.locationType ?? "STORAGE");
    const locationType = parsedType.success ? parsedType.data : "STORAGE";
    return repo.findPaginated({
      limit: input.limit ?? 10,
      page: input.page ?? 1,
      search: input.search,
      entityId: input.entityId,
      locationType,
    });
  }

  if (!input.tag) {
    // use-case returns null -> controller: res.fail(NOT_FOUND) — no flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, "EntityLocation not found");
  }

  const isHospital = input.tag.toLowerCase().includes("hospital");
  if (isHospital) {
    return repo.findByEntityId(input.entityId);
  }
  return repo.findPaginated({
    limit: input.limit ?? 10,
    page: input.page ?? 1,
    search: input.search,
    entityId: input.entityId,
  });
}

export async function updateEntityLocation(
  input: UpdateEntityLocationInput,
): Promise<EntityLocation> {
  const numericId = Number(input.id);
  if (!input.id || Number.isNaN(numericId)) {
    // res.fail('id parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "id parameter is required");
  }

  const parsedBody = entityLocationBodySchema.safeParse(input);
  if (!parsedBody.success) {
    throw new APIError(ErrCode.InvalidArgument, parsedBody.error.issues[0]?.message ?? "Invalid request");
  }

  const existing = await repo.findById(numericId);
  if (!existing) {
    // NOTE: the original use-case returns the *string*
    // `Entity setting with ID ${id} not found` here, but the controller only
    // checks `data === null` (never true for a string) before calling
    // res.success(data) — a real bug: not-found updates silently "succeed"
    // with an error string as the payload. Reproducing that would require
    // this endpoint's response type to be `EntityLocation | string`, which
    // defeats the type-safety point of porting it. Deviation: this port
    // throws a proper 400 instead — the closest of the original's own flag
    // conventions (no isXError flag anywhere in this controller) to what the
    // controller evidently intended.
    throw new APIError(ErrCode.FailedPrecondition, `Entity setting with ID ${input.id} not found`);
  }

  const updated = await repo.update(numericId, {
    updatedBy: input.updatedBy,
    entityId: input.entityId ?? existing.entityId,
    locationName: input.locationName ?? existing.locationName,
    latitude: input.latitude ?? existing.latitude,
    longitude: input.longitude ?? existing.longitude,
    distanceLimitInMeters: input.distanceLimitInMeters ?? existing.distanceLimitInMeters,
    address: input.address ?? existing.address,
    provinceId: input.provinceId ?? existing.provinceId,
    cityId: input.cityId ?? existing.cityId,
    provinceName: input.provinceName ?? existing.provinceName,
    cityName: input.cityName ?? existing.cityName,
  });
  if (!updated) {
    throw new APIError(ErrCode.FailedPrecondition, `Entity setting with ID ${input.id} not found`);
  }
  return updated;
}

export async function deleteEntityLocation(id: string, deletedBy?: number): Promise<boolean> {
  if (!id) {
    // use-case throws a plain Error here, uncaught -> res.error(...) -> 500,
    // same "un-flagged Error -> 500" pattern as getAllEntityLocation above.
    throw new Error("ID is required to delete an entity location");
  }
  const deleted = await repo.softDelete(Number(id), deletedBy);
  if (!deleted) {
    // res.fail(NOT_FOUND) — no flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, "EntityLocation not found");
  }
  return true;
}

export async function validateDistanceLimit(
  id: number,
  longitude: number,
  latitude: number,
): Promise<{ result: boolean; distance: number }> {
  const result = await repo.validateDistanceLimit(id, longitude, latitude);
  if (!result) {
    // Original has two identical `result === null` branches (dead code bug);
    // the second one's message ('Data location not found') is the only one
    // that's ever meaningful, both map to res.fail(...) with no flag -> 400.
    throw new APIError(ErrCode.FailedPrecondition, "Data location not found");
  }
  return result;
}
