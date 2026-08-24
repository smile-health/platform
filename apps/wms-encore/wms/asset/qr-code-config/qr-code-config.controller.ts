// Routes — mirrors apps/wms-service's qrCodeConfigRoutes.ts (mounted at
// /qr-code-config, matching v1Router.use('/qr-code-config', ...)):
//
//   GET    /api/v1/qr-code-config       getAllQrCodeConfigs  (role: allRead)
//   POST   /api/v1/qr-code-config       createQrCodeConfig   (role: onlyAdmin)
//   GET    /api/v1/qr-code-config/:id   getQrCodeConfigById  (role: allRead)
//   PUT    /api/v1/qr-code-config/:id   updateQrCodeConfig   (role: onlyAdmin)
//   DELETE /api/v1/qr-code-config/:id   deleteQrCodeConfig   (role: onlyAdmin)
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module; authorizeRoles.ts's role check
// itself has a documented bug upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./qr-code-config.service";
import type {
  GetAllQrCodeConfigRequest,
  GetAllQrCodeConfigResponse,
  GetQrCodeConfigByIdRequest,
  GetQrCodeConfigByIdResponse,
  CreateQrCodeConfigRequest,
  CreateQrCodeConfigResponse,
  UpdateQrCodeConfigRequest,
  UpdateQrCodeConfigResponse,
  DeleteQrCodeConfigRequest,
  DeleteQrCodeConfigResponse,
} from "./qr-code-config.types";

export const getAllQrCodeConfigs = api(
  { method: "GET", path: "/api/v1/qr-code-config", auth: true, expose: true },
  async (req: GetAllQrCodeConfigRequest): Promise<GetAllQrCodeConfigResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getAllQrCodeConfigs({
      ...req,
      entityId: req.entity_id,
      fallbackHealthcareFacilityId: entityId,
    });
    return { status: "success", data };
  }
);

export const createQrCodeConfig = api(
  { method: "POST", path: "/api/v1/qr-code-config", auth: true, expose: true },
  async (req: CreateQrCodeConfigRequest): Promise<CreateQrCodeConfigResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.createQrCodeConfig({
      ...req,
      createdBy: userID,
      healthcareFacilityId: entityId,
    });
    return { status: "success", data };
  }
);

export const getQrCodeConfigById = api(
  { method: "GET", path: "/api/v1/qr-code-config/:id", auth: true, expose: true },
  async (req: GetQrCodeConfigByIdRequest): Promise<GetQrCodeConfigByIdResponse> => {
    const data = await service.getQrCodeConfigById(req.id);
    return { status: "success", data };
  }
);

export const updateQrCodeConfig = api(
  { method: "PUT", path: "/api/v1/qr-code-config/:id", auth: true, expose: true },
  async (req: UpdateQrCodeConfigRequest): Promise<UpdateQrCodeConfigResponse> => {
    const { userID, entityId } = getAuthData()!;
    const data = await service.updateQrCodeConfig({
      ...req,
      updatedBy: userID,
      healthcareFacilityId: entityId,
    });
    return { status: "success", data };
  }
);

export const deleteQrCodeConfig = api(
  { method: "DELETE", path: "/api/v1/qr-code-config/:id", auth: true, expose: true },
  async (req: DeleteQrCodeConfigRequest): Promise<DeleteQrCodeConfigResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteQrCodeConfig(req.id, userNumericId);
    return { status: "success", data };
  }
);
