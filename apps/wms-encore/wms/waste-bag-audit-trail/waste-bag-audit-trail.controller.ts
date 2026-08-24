// Routes — mirrors apps/wms-service's wasteBagAuditTrailRoutes.ts (mounted at
// /audit-trail, matching v1Router.use('/audit-trail', wasteBagAuditTrailRoutes)):
//
//   GET  /api/v1/audit-trail   getAllWasteBagAuditTrail  (authenticate + rateLimitter)
//
// rateLimitter isn't ported (no rate-limiting middleware exists in this
// Encore port yet — same known gap as every other ported module). See
// waste-bag-audit-trail.types.ts's GetAllWasteBagAuditTrailsRequest comment
// for the filters that were dropped rather than ported, since this table's
// columns don't support them.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-bag-audit-trail.service";
import type {
  GetAllWasteBagAuditTrailsRequest,
  GetAllWasteBagAuditTrailsResponse,
} from "./waste-bag-audit-trail.types";

export const getAllWasteBagAuditTrail = api(
  { method: "GET", path: "/api/v1/audit-trail", auth: true, expose: true },
  async (req: GetAllWasteBagAuditTrailsRequest): Promise<GetAllWasteBagAuditTrailsResponse> => {
    getAuthData()!;
    const data = await service.getAllWasteBagAuditTrails(req);
    return { status: "success", data };
  }
);
