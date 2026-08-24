// Routes — mirrors apps/wms-service's wasteClassificationRoutes.ts (mounted at
// /waste-classification, matching v1Router.use('/waste-classification', ...)):
//
//   GET    /api/v1/waste-classification       getAllWasteClassification    (role: allRead)
//   POST   /api/v1/waste-classification       createWasteClassification    (role: onlySuperAdmin)
//   GET    /api/v1/waste-classification/:id   getWasteClassificationById   (role: allRead)
//   PUT    /api/v1/waste-classification/:id   updateWasteClassification    (role: onlySuperAdmin)
//   DELETE /api/v1/waste-classification/:id   deleteWasteClassification    (role: onlySuperAdmin)
//
// Role-based authorization (allRead / onlySuperAdmin) isn't enforced yet —
// same known gap as every other ported module; authorizeRoles.ts's role
// check itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-classification.service";
import type {
  GetAllWasteClassificationRequest,
  GetAllWasteClassificationResponse,
  GetWasteClassificationByIdRequest,
  GetWasteClassificationByIdResponse,
  CreateWasteClassificationRequest,
  CreateWasteClassificationResponse,
  UpdateWasteClassificationRequest,
  UpdateWasteClassificationResponse,
  DeleteWasteClassificationRequest,
  DeleteWasteClassificationResponse,
} from "./waste-classification.types";

export const getAllWasteClassification = api(
  { method: "GET", path: "/api/v1/waste-classification", auth: true, expose: true },
  async (req: GetAllWasteClassificationRequest): Promise<GetAllWasteClassificationResponse> => {
    const data = await service.getAllWasteClassification(req);
    return { status: "success", data };
  }
);

export const createWasteClassification = api(
  { method: "POST", path: "/api/v1/waste-classification", auth: true, expose: true },
  async (req: CreateWasteClassificationRequest): Promise<CreateWasteClassificationResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteClassification({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getWasteClassificationById = api(
  { method: "GET", path: "/api/v1/waste-classification/:id", auth: true, expose: true },
  async (req: GetWasteClassificationByIdRequest): Promise<GetWasteClassificationByIdResponse> => {
    const data = await service.getWasteClassificationById(req.id);
    return { status: "success", data };
  }
);

export const updateWasteClassification = api(
  { method: "PUT", path: "/api/v1/waste-classification/:id", auth: true, expose: true },
  async (req: UpdateWasteClassificationRequest): Promise<UpdateWasteClassificationResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateWasteClassification({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteWasteClassification = api(
  { method: "DELETE", path: "/api/v1/waste-classification/:id", auth: true, expose: true },
  async (req: DeleteWasteClassificationRequest): Promise<DeleteWasteClassificationResponse> => {
    const data = await service.deleteWasteClassification(req.id);
    return { status: "success", data };
  }
);
