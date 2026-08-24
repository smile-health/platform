import * as repo from "./waste-bag-audit-trail.repository";
import type { GetAllWasteBagAuditTrailsRequest, PaginatedWasteBagAuditTrailEntries } from "./waste-bag-audit-trail.types";

// Mirrors auditTrailHandler.ts — records the transition for compliance.
// Has no idea the scheduling module also reacts to the same event.
export async function recordTransition(input: {
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
}): Promise<void> {
  await repo.insertAuditTrailEntry(input);
}

function sanitizePaginationParams(limit?: number, page?: number): { limit: number; page: number } {
  // Mirrors shared/utils/pagination.ts paginationUtils.sanitizePaginationParams,
  // as used by GetAllWasteBagAuditTrail.executeAll (maxLimit default 1000,
  // falls back to limit=10/page=1 for anything that isn't a positive integer).
  const maxLimit = 1000;
  const safeLimit = Number.isInteger(limit) && (limit as number) > 0 ? Math.min(limit as number, maxLimit) : 10;
  const safePage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : 1;
  return { limit: safeLimit, page: safePage };
}

// Mirrors GetAllWasteBagAuditTrail.executeAll -> WasteBagAuditTrailRepositoryImpl.getAllWasteBagAuditTrails.
// See GetAllWasteBagAuditTrailsRequest's comment: search/healthcareFacilityId/
// transporterId/thirdPartyProviderId are dropped, not silently no-op'd, since
// this table has no matching columns to filter/search on.
export async function getAllWasteBagAuditTrails(
  input: GetAllWasteBagAuditTrailsRequest
): Promise<PaginatedWasteBagAuditTrailEntries> {
  const { limit, page } = sanitizePaginationParams(input.limit, input.page);
  try {
    return await repo.findPaginated({ limit, page, wasteBagId: input.wasteBagId });
  } catch (error) {
    console.error("Error retrieving wastebag audit trail:", error);
    throw new Error("Error retrieving wastebag audit trail");
  }
}
