// Routes — mirrors apps/wms-service's healthcareAssetRoutes.ts (mounted at
// /healthcare-asset, matching v1Router.use('/healthcare-asset', ...)):
//
//   POST   /api/v1/healthcare-asset       createHealthcareAsset  (role: onlySuperAdmin + onlyAdminHF)
//   GET    /api/v1/healthcare-asset/:id   getHealthcareAssetById (role: onlyHf)
//   PUT    /api/v1/healthcare-asset/:id   updateHealthcareAsset  (role: onlySuperAdmin + onlyAdminHF)
//
// NOTE: the original controller also exports getActiveHealthcareWasteScaleAssets
// (backed by a real use-case + repository method), but it is never wired to a
// route in healthcareAssetRoutes.ts or routes/index.ts — dead code in the
// original. Not ported: there is no endpoint to mirror.
//
// Role-based authorization (onlySuperAdmin/onlyAdminHF/onlyHf) and the
// rateLimitter middleware aren't enforced yet — same known gap as every other
// ported module.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./healthcare-asset.service";
import type {
  CreateHealthcareAssetRequest,
  CreateHealthcareAssetResponse,
  GetHealthcareAssetByIdRequest,
  GetHealthcareAssetByIdResponse,
  UpdateHealthcareAssetRequest,
  UpdateHealthcareAssetResponse,
} from "./healthcare-asset.types";

export const createHealthcareAsset = api(
  { method: "POST", path: "/api/v1/healthcare-asset", auth: true, expose: true },
  async (req: CreateHealthcareAssetRequest): Promise<CreateHealthcareAssetResponse> => {
    const data = await service.createHealthcareAsset(req);
    return { status: "success", data };
  }
);

export const getHealthcareAssetById = api(
  { method: "GET", path: "/api/v1/healthcare-asset/:id", auth: true, expose: true },
  async (req: GetHealthcareAssetByIdRequest): Promise<GetHealthcareAssetByIdResponse> => {
    const { entityId } = getAuthData()!;
    const token = req.authorization?.replace(/^Bearer\s+/i, "");
    // Mirrors healthcareAssetController.ts: `(req.headers['accept-language']
    // as string)?.toLowerCase() || 'id'`, then `lang.includes('en') ? 'en' : 'id'`.
    const acceptLanguage = req.acceptLanguage?.toLowerCase() ?? "id";
    const lang = acceptLanguage.includes("en") ? "en" : "id";
    const data = await service.getHealthcareAssetById(req.id, req.healthcareFacilityId, entityId, token, lang);
    return { status: "success", data };
  }
);

export const updateHealthcareAsset = api(
  { method: "PUT", path: "/api/v1/healthcare-asset/:id", auth: true, expose: true },
  async (req: UpdateHealthcareAssetRequest): Promise<UpdateHealthcareAssetResponse> => {
    const token = req.authorization?.replace(/^Bearer\s+/i, "");
    const data = await service.updateHealthcareAsset(req, token);
    return { status: "success", data };
  }
);
