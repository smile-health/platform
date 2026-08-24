// Routes — mirrors apps/wms-service's wasteTransportationRequestRoutes.ts
// (mounted at /waste-transportation-request, matching
// v1Router.use('/waste-transportation-request', wasteTransportationRequestRoutes)):
//
//   GET    /api/v1/waste-transportation-request       getAllWasteTransportationRequests  (role: allRead)
//   POST   /api/v1/waste-transportation-request       createWasteTransportationRequest   (role: onlyAdmin)
//   GET    /api/v1/waste-transportation-request/:id   getWasteTransportationRequestById  (role: allRead)
//   PUT    /api/v1/waste-transportation-request/:id   updateWasteTransportationRequest   (role: onlyAdmin)
//   DELETE /api/v1/waste-transportation-request/:id   deleteWasteTransportationRequest   (role: onlyAdmin)
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module; authorizeRoles.ts's role check
// itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-transportation-request.service";
import type {
  GetWasteTransportationRequestByIdRequest,
  GetWasteTransportationRequestByIdResponse,
  GetAllWasteTransportationRequestsRequest,
  GetAllWasteTransportationRequestsResponse,
  CreateWasteTransportationRequestRequest,
  CreateWasteTransportationRequestResponse,
  UpdateWasteTransportationRequestRequest,
  UpdateWasteTransportationRequestResponse,
  DeleteWasteTransportationRequestRequest,
  DeleteWasteTransportationRequestResponse,
} from "./waste-transportation-request.types";

export const getAllWasteTransportationRequests = api(
  { method: "GET", path: "/api/v1/waste-transportation-request", auth: true, expose: true },
  async (
    req: GetAllWasteTransportationRequestsRequest
  ): Promise<GetAllWasteTransportationRequestsResponse> => {
    const data = await service.getAllWasteTransportationRequests(req);
    return { status: "success", data };
  }
);

export const createWasteTransportationRequest = api(
  { method: "POST", path: "/api/v1/waste-transportation-request", auth: true, expose: true },
  async (
    req: CreateWasteTransportationRequestRequest
  ): Promise<CreateWasteTransportationRequestResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteTransportationRequest({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getWasteTransportationRequestById = api(
  { method: "GET", path: "/api/v1/waste-transportation-request/:id", auth: true, expose: true },
  async (
    req: GetWasteTransportationRequestByIdRequest
  ): Promise<GetWasteTransportationRequestByIdResponse> => {
    const data = await service.getWasteTransportationRequestById(req.id);
    return { status: "success", data };
  }
);

export const updateWasteTransportationRequest = api(
  { method: "PUT", path: "/api/v1/waste-transportation-request/:id", auth: true, expose: true },
  async (
    req: UpdateWasteTransportationRequestRequest
  ): Promise<UpdateWasteTransportationRequestResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateWasteTransportationRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteWasteTransportationRequest = api(
  { method: "DELETE", path: "/api/v1/waste-transportation-request/:id", auth: true, expose: true },
  async (
    req: DeleteWasteTransportationRequestRequest
  ): Promise<DeleteWasteTransportationRequestResponse> => {
    // Original: req.user?.id (numeric id), mirrored by getAuthData()'s
    // userNumericId field, same as global-settings.controller.ts's delete.
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteWasteTransportationRequest(req.id, userNumericId);
    return { status: "success", data };
  }
);
