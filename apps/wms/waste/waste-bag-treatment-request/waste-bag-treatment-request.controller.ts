// Routes — mirrors apps/wms-service's wasteBagTreatmentRequestRoutes.ts
// (mounted at /waste-bag-treatment-request, matching v1Router.use(
// '/waste-bag-treatment-request', wasteBagTreatmentRequestRoutes)):
//
//   GET    /api/v1/waste-bag-treatment-request       getAllWasteBagTreatmentRequests   (role: allRead)
//   POST   /api/v1/waste-bag-treatment-request       createWasteBagTreatmentRequest    (role: onlyAdmin)
//   GET    /api/v1/waste-bag-treatment-request/:id   getWasteBagTreatmentRequestById    (role: allRead)
//   PUT    /api/v1/waste-bag-treatment-request/:id   updateWasteBagTreatmentRequest     (role: onlyAdmin)
//   DELETE /api/v1/waste-bag-treatment-request/:id   deleteWasteBagTreatmentRequest     (role: onlyAdmin)
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module; authorizeRoles.ts's role check
// itself has a documented bug upstream (see the migration plan). Note the
// original route file also imports onlySuperAdmin/onlyAdminHF/onlyHf but
// never actually uses them on any of this file's routes — dead imports,
// not ported.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-bag-treatment-request.service";
import type {
  GetWasteBagTreatmentRequestByIdRequest,
  GetWasteBagTreatmentRequestByIdResponse,
  GetAllWasteBagTreatmentRequestsRequest,
  GetAllWasteBagTreatmentRequestsResponse,
  CreateWasteBagTreatmentRequestRequest,
  CreateWasteBagTreatmentRequestResponse,
  UpdateWasteBagTreatmentRequestRequest,
  UpdateWasteBagTreatmentRequestResponse,
  DeleteWasteBagTreatmentRequestRequest,
  DeleteWasteBagTreatmentRequestResponse,
} from "./waste-bag-treatment-request.types";

export const getAllWasteBagTreatmentRequests = api(
  { method: "GET", path: "/api/v1/waste-bag-treatment-request", auth: true, expose: true },
  async (
    req: GetAllWasteBagTreatmentRequestsRequest
  ): Promise<GetAllWasteBagTreatmentRequestsResponse> => {
    const data = await service.getAllWasteBagTreatmentRequests(req);
    return { status: "success", data };
  }
);

export const createWasteBagTreatmentRequest = api(
  { method: "POST", path: "/api/v1/waste-bag-treatment-request", auth: true, expose: true },
  async (req: CreateWasteBagTreatmentRequestRequest): Promise<CreateWasteBagTreatmentRequestResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteBagTreatmentRequest({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getWasteBagTreatmentRequestById = api(
  { method: "GET", path: "/api/v1/waste-bag-treatment-request/:id", auth: true, expose: true },
  async (
    req: GetWasteBagTreatmentRequestByIdRequest
  ): Promise<GetWasteBagTreatmentRequestByIdResponse> => {
    const data = await service.getWasteBagTreatmentRequestById(req.id);
    return { status: "success", data };
  }
);

export const updateWasteBagTreatmentRequest = api(
  { method: "PUT", path: "/api/v1/waste-bag-treatment-request/:id", auth: true, expose: true },
  async (req: UpdateWasteBagTreatmentRequestRequest): Promise<UpdateWasteBagTreatmentRequestResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateWasteBagTreatmentRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteWasteBagTreatmentRequest = api(
  { method: "DELETE", path: "/api/v1/waste-bag-treatment-request/:id", auth: true, expose: true },
  async (req: DeleteWasteBagTreatmentRequestRequest): Promise<DeleteWasteBagTreatmentRequestResponse> => {
    // Original: deletedBy: req.user?.id — the numeric internal id, distinct
    // from req.user?.user_uuid used for createdBy/updatedBy elsewhere.
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteWasteBagTreatmentRequest(req.id, userNumericId);
    return { status: "success", data };
  }
);
