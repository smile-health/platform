// Routes — mirrors apps/wms-service's wasteHierarchyRouters.ts (mounted at
// /waste-hierarchy, matching v1Router.use('/waste-hierarchy', ...)):
//
//   POST   /api/v1/waste-hierarchy                                  createWasteHierarchy               (role: onlySuperAdmin)
//   GET    /api/v1/waste-hierarchy                                  getAllWasteHierarchy                (role: allRead)
//   GET    /api/v1/waste-hierarchy/parent-hierarchy                 getWasteHierarchyByParentHierarchyId (role: allRead)
//   GET    /api/v1/waste-hierarchy/explanation-waste-classification explanationOfWasteClassification    (role: allRead)
//   GET    /api/v1/waste-hierarchy/:id                               getWasteHierarchyById               (role: allRead)
//   PUT    /api/v1/waste-hierarchy/:id                               updateWasteHierarchy                (role: onlySuperAdmin)
//   DELETE /api/v1/waste-hierarchy/:id                               deleteWasteHierarchy                (role: onlySuperAdmin)
//
// Role-based authorization (allRead / onlySuperAdmin) isn't enforced yet —
// same known gap as every other ported module; authorizeRoles.ts's role
// check itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-hierarchy.service";
import type {
  GetWasteHierarchyByIdRequest,
  GetWasteHierarchyByIdResponse,
  GetWasteHierarchyByParentHierarchyIdRequest,
  GetWasteHierarchyByParentHierarchyIdResponse,
  GetAllWasteHierarchyRequest,
  GetAllWasteHierarchyResponse,
  CreateWasteHierarchyRequest,
  CreateWasteHierarchyResponse,
  UpdateWasteHierarchyRequest,
  UpdateWasteHierarchyResponse,
  DeleteWasteHierarchyRequest,
  DeleteWasteHierarchyResponse,
  ExplanationOfWasteClassificationRequest,
  ExplanationOfWasteClassificationResponse,
} from "./waste-hierarchy.types";

export const createWasteHierarchy = api(
  { method: "POST", path: "/api/v1/waste-hierarchy", auth: true, expose: true },
  async (req: CreateWasteHierarchyRequest): Promise<CreateWasteHierarchyResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteHierarchy({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getAllWasteHierarchy = api(
  { method: "GET", path: "/api/v1/waste-hierarchy", auth: true, expose: true },
  async (req: GetAllWasteHierarchyRequest): Promise<GetAllWasteHierarchyResponse> => {
    const data = await service.getAllWasteHierarchy(req);
    return { status: "success", data };
  }
);

export const getWasteHierarchyByParentHierarchyId = api(
  { method: "GET", path: "/api/v1/waste-hierarchy/parent-hierarchy", auth: true, expose: true },
  async (
    req: GetWasteHierarchyByParentHierarchyIdRequest
  ): Promise<GetWasteHierarchyByParentHierarchyIdResponse> => {
    const data = await service.getWasteHierarchyByParentHierarchyId(req.parent_hierarchy_id);
    return { status: "success", data };
  }
);

export const explanationOfWasteClassification = api(
  { method: "GET", path: "/api/v1/waste-hierarchy/explanation-waste-classification", auth: true, expose: true },
  async (
    _req: ExplanationOfWasteClassificationRequest
  ): Promise<ExplanationOfWasteClassificationResponse> => {
    const data = await service.explanationOfWasteClassification();
    return { status: "success", data };
  }
);

export const getWasteHierarchyById = api(
  { method: "GET", path: "/api/v1/waste-hierarchy/:id", auth: true, expose: true },
  async (req: GetWasteHierarchyByIdRequest): Promise<GetWasteHierarchyByIdResponse> => {
    const data = await service.getWasteHierarchyById(req.id);
    return { status: "success", data };
  }
);

export const updateWasteHierarchy = api(
  { method: "PUT", path: "/api/v1/waste-hierarchy/:id", auth: true, expose: true },
  async (req: UpdateWasteHierarchyRequest): Promise<UpdateWasteHierarchyResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateWasteHierarchy({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteWasteHierarchy = api(
  { method: "DELETE", path: "/api/v1/waste-hierarchy/:id", auth: true, expose: true },
  async (req: DeleteWasteHierarchyRequest): Promise<DeleteWasteHierarchyResponse> => {
    const data = await service.deleteWasteHierarchy(req.id);
    return { status: "success", data };
  }
);
