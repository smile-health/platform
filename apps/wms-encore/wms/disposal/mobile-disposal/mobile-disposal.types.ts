// Mirrors apps/wms-service's interfaces/http/routes/mobile/disposalRoutes.ts +
// controllers/mobile/disposalController.ts (getAllDisposalUseCaseController),
// mounted at v1RouterMobile.use('/disposal', disposalRoutes) under
// app.use('/api/v1/mobile', ...).
//
//   GET /api/v1/mobile/disposal   getAllDisposalUseCaseController
//
// This is a thin wrapper around the bast module's already-ported
// getAllDisposal (see ../bast/bast.service.ts, itself a port of the SAME
// underlying GetAllDisposalUseCase / DisposalRepositoryImpl the original
// mobile controller calls) — the mobile route just fixes status='APPROVED'
// and isRead=false, and never supports the bast_no single-record
// short-circuit the non-mobile /api/v1/bast route does (the original mobile
// controller never reads a bast_no query param either).
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module.

import type { PaginatedDisposals } from "../bast/bast.types";

export interface GetAllMobileDisposalRequest {
  limit?: number;
  page?: number;
  healthcareFacilityId?: number;
  search?: string;
}
export interface GetAllMobileDisposalResponse {
  status: "success";
  data: PaginatedDisposals;
}
