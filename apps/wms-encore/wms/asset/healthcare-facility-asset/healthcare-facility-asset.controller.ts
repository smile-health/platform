// Routes — mirrors apps/wms-service's healthcareFacilityAssetRoutes.ts
// (mounted at /healthcare-facility-asset, matching
// v1Router.use('/healthcare-facility-asset', healthcareFacilityAsset)):
//
//   GET    /api/v1/healthcare-facility-asset          getAllHealthcareFacilityAssets           (role: onlyHf)
//   GET    /api/v1/healthcare-facility-asset/entity   getAllHealthcareFacilityAssetsByEntityId (role: onlyHf)
//   POST   /api/v1/healthcare-facility-asset          createHealthcareFacilityAsset            (role: onlySuperAdmin + onlyAdminHF)
//   GET    /api/v1/healthcare-facility-asset/:id      getHealthcareFacilityAssetById            (role: onlyHf)
//   PUT    /api/v1/healthcare-facility-asset/:id      updateHealthcareFacilityAsset             (role: onlySuperAdmin + onlyAdminHF)
//   PATCH  /api/v1/healthcare-facility-asset/:id      patchHealthcareFacilityAsset              (role: onlySuperAdmin + onlyAdminHF)
//   DELETE /api/v1/healthcare-facility-asset/:id      deleteHealthcareFacilityAsset             (role: onlySuperAdmin + onlyAdminHF)
//
// Role-based authorization (onlyHf / onlySuperAdmin / onlyAdminHF) isn't
// enforced yet — same known gap as every other ported module;
// authorizeRoles.ts's role check itself has a documented bug upstream (see
// the migration plan).
//
// NOTE: healthcare-facility-asset-activity is a DIFFERENT, sibling module
// (healthcareFacilityAssetActivityRoutes.ts in the original) — not ported
// here.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./healthcare-facility-asset.service";
import type {
  GetHealthcareFacilityAssetByIdRequest,
  GetHealthcareFacilityAssetByIdResponse,
  GetAllHealthcareFacilityAssetsRequest,
  GetAllHealthcareFacilityAssetsResponse,
  GetAllHealthcareFacilityAssetsByEntityIdRequest,
  GetAllHealthcareFacilityAssetsByEntityIdResponse,
  CreateHealthcareFacilityAssetRequest,
  CreateHealthcareFacilityAssetResponse,
  UpdateHealthcareFacilityAssetRequest,
  UpdateHealthcareFacilityAssetResponse,
  PatchHealthcareFacilityAssetRequest,
  PatchHealthcareFacilityAssetResponse,
  DeleteHealthcareFacilityAssetRequest,
  DeleteHealthcareFacilityAssetResponse,
} from "./healthcare-facility-asset.types";

export const getAllHealthcareFacilityAssets = api(
  { method: "GET", path: "/api/v1/healthcare-facility-asset", auth: true, expose: true },
  async (req: GetAllHealthcareFacilityAssetsRequest): Promise<GetAllHealthcareFacilityAssetsResponse> => {
    const data = await service.getAllHealthcareFacilityAssets(req);
    return { status: "success", data };
  }
);

export const getAllHealthcareFacilityAssetsByEntityId = api(
  { method: "GET", path: "/api/v1/healthcare-facility-asset/entity", auth: true, expose: true },
  async (
    req: GetAllHealthcareFacilityAssetsByEntityIdRequest
  ): Promise<GetAllHealthcareFacilityAssetsByEntityIdResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getAllHealthcareFacilityAssetsByEntityId({ ...req, healthcareFacilityId: entityId });
    return { status: "success", data };
  }
);

export const createHealthcareFacilityAsset = api(
  { method: "POST", path: "/api/v1/healthcare-facility-asset", auth: true, expose: true },
  async (req: CreateHealthcareFacilityAssetRequest): Promise<CreateHealthcareFacilityAssetResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.createHealthcareFacilityAsset({
      ...req,
      healthcareFacilityId: req.healthcareFacilityId ?? entityId,
      createdBy: userID,
    });
    return { status: "success", data };
  }
);

export const getHealthcareFacilityAssetById = api(
  { method: "GET", path: "/api/v1/healthcare-facility-asset/:id", auth: true, expose: true },
  async (req: GetHealthcareFacilityAssetByIdRequest): Promise<GetHealthcareFacilityAssetByIdResponse> => {
    const data = await service.getHealthcareFacilityAssetById(req.id);
    return { status: "success", data };
  }
);

export const updateHealthcareFacilityAsset = api(
  { method: "PUT", path: "/api/v1/healthcare-facility-asset/:id", auth: true, expose: true },
  async (req: UpdateHealthcareFacilityAssetRequest): Promise<UpdateHealthcareFacilityAssetResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.updateHealthcareFacilityAsset({
      ...req,
      healthcareFacilityId: req.healthcareFacilityId ?? entityId,
      updatedBy: userID,
    });
    return { status: "success", data };
  }
);

export const patchHealthcareFacilityAsset = api(
  { method: "PATCH", path: "/api/v1/healthcare-facility-asset/:id", auth: true, expose: true },
  async (req: PatchHealthcareFacilityAssetRequest): Promise<PatchHealthcareFacilityAssetResponse> => {
    const data = await service.patchHealthcareFacilityAsset(req);
    return { status: "success", data };
  }
);

export const deleteHealthcareFacilityAsset = api(
  { method: "DELETE", path: "/api/v1/healthcare-facility-asset/:id", auth: true, expose: true },
  async (req: DeleteHealthcareFacilityAssetRequest): Promise<DeleteHealthcareFacilityAssetResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteHealthcareFacilityAsset(req.id, userNumericId);
    return { status: "success", data };
  }
);
