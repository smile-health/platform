// Routes — mirrors apps/wms-service's manualScaleRequest.ts (mounted at
// /manual-scale, matching v1Router.use('/manual-scale', manualScaleRequest)):
//
//   POST  /api/v1/manual-scale           createManualScaleRequest   (role: allRead)
//   GET   /api/v1/manual-scale           getAllManualScaleRequests  (role: allRead)
//   PATCH /api/v1/manual-scale/activate  activateManualScaleRequest (role: onlyAdminHF)
//   POST  /api/v1/manual-scale-request/:id/status updateStatus     (skeleton, pre-existing, not part of old contract)
//
// Role-based authorization (allRead / onlyAdminHF) isn't enforced yet — same
// known gap as every other ported module; authorizeRoles.ts's role check
// itself has a documented bug upstream (see the migration plan). The original
// route file also runs rateLimitter ahead of authorizeRoles on every route —
// not ported, no rate-limiting middleware exists in this Encore port yet.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./manual-scale-request.service";
import type {
  ActivateManualScaleRequestRequest,
  ActivateManualScaleRequestResponse,
  CreateManualScaleRequestRequest,
  CreateManualScaleRequestResponse,
  GetAllManualScaleRequestsRequest,
  GetAllManualScaleRequestsResponse,
  UpdateManualScaleRequestStatusRequest,
  UpdateManualScaleRequestStatusResponse,
} from "./manual-scale-request.types";

export const createManualScaleRequest = api(
  { method: "POST", path: "/api/v1/manual-scale", auth: true, expose: true },
  async (req: CreateManualScaleRequestRequest): Promise<CreateManualScaleRequestResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.createManualScaleRequest({ ...req, requestedBy: userID, entityId });
    return { status: "success", data };
  }
);

export const getAllManualScaleRequests = api(
  { method: "GET", path: "/api/v1/manual-scale", auth: true, expose: true },
  async (req: GetAllManualScaleRequestsRequest): Promise<GetAllManualScaleRequestsResponse> => {
    // Mirrors getAllManualScaleRequest controller's entityIdParam logic:
    // defaults to the caller's own entity unless they're super_admin, but a
    // caller-supplied entityId still overrides that default regardless of
    // role — preserved verbatim, including that override, since it's the
    // original's actual behavior (not something to silently "fix" here).
    const { entityId: callerEntityId, isSuperAdmin } = getAuthData()!;
    const data = await service.getAllManualScaleRequests({
      ...req,
      entityId: req.entityId ?? (isSuperAdmin ? undefined : callerEntityId),
    });
    return { status: "success", data };
  }
);

export const activateManualScaleRequest = api(
  { method: "PATCH", path: "/api/v1/manual-scale/activate", auth: true, expose: true },
  async (req: ActivateManualScaleRequestRequest): Promise<ActivateManualScaleRequestResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.activateManualScaleRequest({
      id: req.id,
      status: req.status as "APPROVED" | "REJECTED",
      processedBy: userID,
    });
    return { status: "success", data };
  }
);

export const updateStatus = api(
  { method: "POST", path: "/api/v1/manual-scale-request/:id/status", auth: true, expose: true },
  async (req: UpdateManualScaleRequestStatusRequest): Promise<UpdateManualScaleRequestStatusResponse> => {
    const { userID } = getAuthData()!;
    const result = await service.updateStatus({ ...req, createdBy: userID });
    return { status: "success", data: result };
  }
);

// Internal-only (no method/path/expose) — callable from other services via
// ~encore/clients, not over public HTTP. scheduled-event-dispatcher's entry
// point into this domain's markWaitingForApproval, so that cross-service hop
// is a real Encore RPC (shows up in the trace/service graph) instead of a
// plain cross-service TypeScript import into this module's repository layer.
export const markWaitingForApproval = api(
  {},
  async (req: { manualScaleId: number }): Promise<void> => {
    await service.markWaitingForApproval(req.manualScaleId);
  }
);
