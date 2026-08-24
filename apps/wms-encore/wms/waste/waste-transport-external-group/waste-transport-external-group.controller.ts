// Routes — mirrors apps/wms-service's wasteTransportExternalGroupRoutes.ts
// (mounted at /waste-transport-external-group, matching
// v1Router.use('/waste-transport-external-group', wasteTransportExternalGroupRoutes)):
//
//   GET  /api/v1/waste-transport-external-group          getAllWasteTransportExternalGroup  (role: allRead)
//   GET  /api/v1/waste-transport-external-group/detail   getWasteTransportExternalGroup      (role: allRead)
//
// Only these two GET endpoints exist in the original — no create/update/
// delete route is wired for this module there (the domain repository
// interfaces declare create/update methods, but nothing in the routes file
// calls them for THIS module; creation happens via
// waste-transportation-group's flows instead). Role-based authorization
// (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as every other ported
// module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-transport-external-group.service";
import type {
  GetAllWasteTransportExternalGroupRequest,
  GetAllWasteTransportExternalGroupResponse,
  GetWasteTransportExternalGroupRequest,
  GetWasteTransportExternalGroupResponse,
} from "./waste-transport-external-group.types";

export const getAllWasteTransportExternalGroup = api(
  { method: "GET", path: "/api/v1/waste-transport-external-group", auth: true, expose: true },
  async (req: GetAllWasteTransportExternalGroupRequest): Promise<GetAllWasteTransportExternalGroupResponse> => {
    const authData = getAuthData()!;
    const data = await service.getAllWasteTransportExternalGroup({
      ...req,
      role: authData.externalPropertiesRoleType,
      authEntityId: authData.entityId,
    });
    return { status: "success", data };
  }
);

export const getWasteTransportExternalGroup = api(
  { method: "GET", path: "/api/v1/waste-transport-external-group/detail", auth: true, expose: true },
  async (req: GetWasteTransportExternalGroupRequest): Promise<GetWasteTransportExternalGroupResponse> => {
    const data = await service.getWasteTransportExternalGroup(req);
    return { status: "success", data };
  }
);
