import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./healthcare-facility-asset-activity.repository";
import { healthcareFacilityAssetActivityBodySchema } from "./healthcare-facility-asset-activity.schema";
import type {
  HealthcareFacilityAssetActivity,
  PaginatedHealthcareFacilityAssetActivity,
} from "./healthcare-facility-asset-activity.types";

// healthcareFacilityAssetActivityController.ts never calls res.fail(...) —
// every catch path calls res.error(error), which jsonResponse.ts's res.error
// implementation always maps to a plain 500 (no isXError-style option is ever
// passed for this controller). Per the migration convention, that means every
// thrown error here maps to ErrCode.Internal, not FailedPrecondition/NotFound/
// etc — unlike most other ported modules, which go through res.fail.

export async function createHealthcareFacilityAssetActivity(input: {
  createdBy: string;
  activityType: string;
  hfAssetId: number;
  operatorId: string;
  createdAt: string;
  startDate: string;
  endDate?: string;
}): Promise<HealthcareFacilityAssetActivity> {
  const parsed = healthcareFacilityAssetActivityBodySchema.safeParse(input);
  if (!parsed.success) {
    // The original's request schema is enforced by validateRequest
    // middleware, which itself responds with res.fail(...,
    // {isValidationError:true}) -> 422 on failure, so this port maps schema
    // failures to InvalidArgument (the port's only opportunity to observe
    // that middleware's behavior, since it lives outside the controller).
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const exists = await repo.hfAssetExists(parsed.data.hfAssetId);
  if (!exists) {
    // Original use-case: `throw new Error('Healthcare Facility Asset not
    // found')`, caught by the controller and sent via res.error(error) -> 500.
    throw new APIError(ErrCode.Internal, "Healthcare Facility Asset not found");
  }

  const createdAt = new Date(parsed.data.createdAt);
  const startDate = new Date(parsed.data.startDate);
  const endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : undefined;

  const entity: HealthcareFacilityAssetActivity = {
    createdBy: input.createdBy,
    activityType: parsed.data.activityType,
    hfAssetId: parsed.data.hfAssetId,
    operatorId: parsed.data.operatorId,
    createdAt,
    startDate,
    endDate,
  };

  await repo.create(entity);
  return entity;
}

export async function getAllHealthcareFacilityAssetActivity(input: {
  limit?: number;
  page?: number;
  activityType?: string;
  hfAssetId?: number;
}): Promise<PaginatedHealthcareFacilityAssetActivity> {
  // Original use-case/repository default limit=10, page=1 when the query
  // param can't be coerced to a number (Number(undefined) === NaN, sanitized
  // by paginationUtils.sanitizePaginationParams — mirrored here directly).
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findAllPaginated({
    limit: safeLimit,
    page: safePage,
    activityType: input.activityType,
    hfAssetId: input.hfAssetId,
  });
}
