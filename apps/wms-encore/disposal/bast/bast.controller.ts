// Routes — mirrors apps/wms-service's disposalRoutes.ts (mounted at /bast,
// matching v1Router.use('/bast', disposalRoutes), app.ts's
// app.use('/api/v1', v1Router)):
//
//   GET  /api/v1/bast          getAllDisposalController  (role: allRead)
//   POST /api/v1/bast          createDispose             (role: allRead)
//   PUT  /api/v1/bast/confirm  confirmationBastNumber     (role: allRead)
//
// Role-based authorization (allRead) isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as
// every other ported module; authorizeRoles.ts's role check itself has a
// documented bug upstream (see the migration plan). The original route file
// also runs rateLimitter ahead of authorizeRoles on every route — not
// ported, no rate-limiting middleware exists in this Encore port yet.
//
// getDisposal (GET by :bast_no path param) is exported by the original
// controller but never actually mounted as its own route in
// disposalRoutes.ts — its behavior is reachable only via GET /api/v1/bast?bast_no=...
// (getAllDisposalController's short-circuit), which is what getAllBast below
// preserves; there is no separate /api/v1/bast/:bast_no route to port.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./bast.service";
import type {
  ConfirmBastRequest,
  ConfirmBastResponse,
  CreateBastRequest,
  CreateBastResponse,
  GetAllBastRequest,
  GetAllBastResponse,
} from "./bast.types";

export const createDispose = api(
  { method: "POST", path: "/api/v1/bast", auth: true, expose: true },
  async (req: CreateBastRequest): Promise<CreateBastResponse> => {
    const data = await service.createDispose(req);
    return { status: "success", data };
  }
);

export const confirmationBastNumber = api(
  { method: "PUT", path: "/api/v1/bast/confirm", auth: true, expose: true },
  async (req: ConfirmBastRequest): Promise<ConfirmBastResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.confirmationBastNumber({ ...req, userUuid: userID });
    return { status: "success", data };
  }
);

export const getAllBast = api(
  { method: "GET", path: "/api/v1/bast", auth: true, expose: true },
  async (req: GetAllBastRequest): Promise<GetAllBastResponse> => {
    const { entityId, entityTypeName, isSuperAdmin } = getAuthData()!;
    const data = await service.getAllDisposal({
      ...req,
      callerEntityId: entityId,
      callerEntityType: entityTypeName,
      isSuperAdmin,
    });
    return { status: "success", data };
  }
);
