// Routes — mirrors apps/wms-service's wasteBagAuditTrailRoutes.ts (mounted at
// /audit-trail, matching v1Router.use('/audit-trail', wasteBagAuditTrailRoutes)):
//
//   GET  /api/v1/audit-trail   getAllWasteBagAuditTrail  (authenticate + rateLimitter)
//
// rateLimitter isn't ported (no rate-limiting middleware exists in this
// Encore port yet — same known gap as every other ported module). See
// waste-bag-audit-trail.types.ts's GetAllWasteBagAuditTrailsRequest comment:
// healthcareFacilityId/transporterId/thirdPartyProviderId filters are ported
// now that migration 16 backs them with real columns; `search` remains
// dropped since it was a dead parameter upstream too.
//
// wasteBagId (query param, GetAllWasteBagAuditTrailsRequest.wasteBagId) is
// typed number here, not the old service's string — see
// waste_bag_audit_trail's migration 2 (2_create_waste_bag_audit_trail.up.sql):
// waste_bag_id is a genuine INTEGER FK to waste_bag.id in this schema, not
// the QR-code string the old MySQL model stored in that column (see
// WasteBagAuditTrailModel.ts's belongsTo(..., sourceKey: 'wasteBagQrCodeId')
// in the old repo — its waste_bag_id actually held the QR code, not a
// numeric PK). This is an intentional modernization, not a break: Encore
// parses/validates numeric query strings into `number` automatically
// (400s on non-numeric input), the same coercion every other plain-number
// GET query param in this port relies on (e.g. manual-scale-request.types.ts's
// `id: Query<number>`), so callers sending "123" as a query string still work.

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
