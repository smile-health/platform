import * as bastService from "../bast/bast.service";
import type { PaginatedDisposals } from "../bast/bast.types";
import type { GetAllMobileDisposalRequest } from "./mobile-disposal.types";

export async function getAllDisposal(
  req: GetAllMobileDisposalRequest,
  auth: { entityId: number; entityTypeName: string; isSuperAdmin: boolean }
): Promise<PaginatedDisposals> {
  // status/isRead are fixed here — the original mobile controller always
  // calls `useCase.execute(limit, page, resolvedHealthcareId, search,
  // 'APPROVED', false)`, unlike the non-mobile /api/v1/bast route which
  // takes both as query params.
  const data = await bastService.getAllDisposal({
    limit: req.limit,
    page: req.page,
    healthcareFacilityId: req.healthcareFacilityId,
    search: req.search,
    status: "APPROVED",
    isRead: "false",
    callerEntityId: auth.entityId,
    callerEntityType: auth.entityTypeName,
    isSuperAdmin: auth.isSuperAdmin,
  });
  // bast_no is never passed above, so getAllDisposal always takes the
  // paginated-list branch, never the single-record DisposalDetail branch.
  return data as PaginatedDisposals;
}
