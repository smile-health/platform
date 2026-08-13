import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./partnership-vehicle-map.repository";
import { partnershipVehicleMapBodySchema } from "./partnership-vehicle-map.schema";
import type {
  CreatePartnershipVehicleMapRequest,
  DeletePartnershipVehicleMapInput,
  GetAllPartnershipVehicleMapInput,
  PaginatedPartnershipVehicleMaps,
  PartnershipVehicleMap,
} from "./partnership-vehicle-map.types";

// partnershipVehicleMapController.ts's res.fail(...) calls are, with one
// exception, called with no options object -> plain 400s (FailedPrecondition).
// The one exception (createPartnershipVehicleMap's use-case returning a
// string) is called with { isValidationError: true } -> 422, noted below.

export async function createPartnershipVehicleMap(
  input: CreatePartnershipVehicleMapRequest,
): Promise<PartnershipVehicleMap> {
  const parsed = partnershipVehicleMapBodySchema.safeParse(input);
  if (!parsed.success) {
    // validateRequest(createPartnershipVehicleMapSchema) middleware in the
    // original runs before the controller and rejects malformed bodies
    // itself (a 400-class response); reproduced here as InvalidArgument
    // (422) as this port's manual-validation convention dictates.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const { partnershipId, vehicleId } = parsed.data;

  // Original: CreatePartnershipVehicleMapUseCase checks
  // `this.partnership.getPartnershipById(partnershipId, '')`; if falsy it
  // returns the string `No asset partnership for ID ${partnershipId}`, which
  // the controller maps via res.fail(data, { isValidationError: true }) -> 422.
  const partnershipExists = await repo.existsPartnership(partnershipId);
  if (!partnershipExists) {
    throw new APIError(ErrCode.InvalidArgument, `No asset partnership for ID ${partnershipId}`);
  }

  await repo.create(partnershipId, vehicleId);
  return { partnershipId, vehicleId };
}

export async function getAllPartnershipVehicleMaps(
  input: GetAllPartnershipVehicleMapInput,
): Promise<PaginatedPartnershipVehicleMaps> {
  // Original: `Number(limit?.toString())` / `Number(page?.toString())` — when
  // limit/page are absent this is `Number(undefined)` = NaN. The use-case
  // passes NaN straight to paginationUtils.sanitizePaginationParams(), which
  // (matching entity-location's own repo convention) is expected to fall back
  // to sane defaults for non-finite input; reproduced here with the same
  // ?? 10 / ?? 1 defaulting entity-location's findPaginated() uses.
  const limit = input.limit && Number.isFinite(input.limit) ? input.limit : 10;
  const page = input.page && Number.isFinite(input.page) ? input.page : 1;

  // Original: `search?.toString() ?? req.user?.entity.id.toString()` — falls
  // back to the authenticated user's entityId when no `search` query param
  // is supplied.
  const search = input.search ?? input.authEntityId;

  return repo.findAllPaginated({ limit, page, search });
}

export async function deletePartnershipVehicleMap(
  input: DeletePartnershipVehicleMapInput,
): Promise<boolean> {
  if (!input.partnershipId || !input.vehicleId) {
    // res.fail('partnership_id and vehicle_id parameter is required') — no
    // flag -> 400
    throw new APIError(ErrCode.FailedPrecondition, "partnership_id and vehicle_id parameter is required");
  }

  const numericPartnershipId = Number(input.partnershipId);
  const numericVehicleId = Number(input.vehicleId);

  // Original use-case: `if (!partnershipId || !vehicleId) throw new
  // Error(...)` is dead code at this call site (the controller already
  // guarded on the raw query-string presence above), but Number(...) of a
  // non-numeric string still yields NaN and slips past that guard in the
  // original too. Preserved: an invalid numeric string reaches the repo call
  // as NaN, which simply matches no rows -> not-found below, same outcome as
  // the original's Sequelize `where: { partnership_id: NaN }`.
  const deletedBy = input.deletedBy ? Number(input.deletedBy) : undefined;

  const deleted = await repo.softDelete(numericPartnershipId, numericVehicleId, deletedBy);
  if (!deleted) {
    // Original use-case returns `null` when not found (not `false`); the
    // controller checks `data === null` -> res.fail('Partnership vehicle map
    // not found') — no flag -> 400.
    throw new APIError(ErrCode.FailedPrecondition, "Partnership vehicle map not found");
  }
  return true;
}
