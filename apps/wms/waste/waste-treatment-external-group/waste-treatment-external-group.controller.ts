// Routes — mirrors apps/wms-service's wasteTreatmentExternalGroupRoutes.ts
// (mounted at /waste-treatment-external-group, matching
// v1Router.use('/waste-treatment-external-group', ...) in routes/index.ts).
// This is the "external" counterpart of waste-bag-treatment-group (built in
// parallel, see waste/waste-bag-treatment-group/) — for treatment handed
// over to a third party rather than handled within the platform's own
// partnership network.
//
//   GET  /api/v1/waste-treatment-external-group          getAllWasteTreatmentExternalGroup  (role: allRead)
//   GET  /api/v1/waste-treatment-external-group/detail    getWasteTreatmentExternalGroup      (role: allRead)
//
// Only these two read endpoints exist on this route table in the original —
// create/receive/status-transition operations on this entity are reached
// through OTHER route tables (e.g. waste-transport-external-group's
// handover flow), not through wasteTreatmentExternalGroupRoutes.ts itself,
// so they are out of scope here.
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module; authorizeRoles.ts's role check itself has a
// documented bug upstream (see the migration plan). The original's manual
// `Authorization` header / `Bearer ` prefix check (-> 422 InvalidArgument on
// failure) is superseded by Encore's `auth: true`, which throws
// Unauthenticated (401) on a missing/invalid token before the handler runs.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-treatment-external-group.service";
import type {
  GetAllWasteTreatmentExternalGroupRequest,
  GetAllWasteTreatmentExternalGroupResponse,
  GetWasteTreatmentExternalGroupRequest,
  GetWasteTreatmentExternalGroupResponse,
} from "./waste-treatment-external-group.types";

export const getAllWasteTreatmentExternalGroup = api(
  { method: "GET", path: "/api/v1/waste-treatment-external-group", auth: true, expose: true },
  async (
    req: GetAllWasteTreatmentExternalGroupRequest
  ): Promise<GetAllWasteTreatmentExternalGroupResponse> => {
    const { entityId, externalRoles, externalPropertiesRoleType } = getAuthData()!;
    const data = await service.getAllWasteTreatmentExternalGroup({
      ...req,
      // Original: `entityId ? Number(entityId) : req.user?.entity.id` — the
      // query param wins if present, else the authenticated user's own
      // entity id.
      entityId: req.entityId ?? entityId,
      externalRoles,
      externalPropertiesRoleType,
    });
    return { status: "success", data };
  }
);

export const getWasteTreatmentExternalGroup = api(
  { method: "GET", path: "/api/v1/waste-treatment-external-group/detail", auth: true, expose: true },
  async (
    req: GetWasteTreatmentExternalGroupRequest
  ): Promise<GetWasteTreatmentExternalGroupResponse> => {
    const data = await service.getWasteTreatmentExternalGroup(req);
    return { status: "success", data };
  }
);
