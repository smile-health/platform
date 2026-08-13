// Routes — mirrors apps/wms-service's partnerVehicleRoutes.ts:
//
//   GET    /api/v1/partner-vehicle                    getAllPartnerVehicles       (authorizeRoles(allRead))
//   GET    /api/v1/partner-vehicle/export              getPartnerVehicleExportExcel (authorizeRoles(allRead))
//   POST   /api/v1/partner-vehicle                    createPartnerVehicle        (authorizeRoles(onlyAdmin))
//   POST   /api/v1/partner-vehicle/bulk-healthcare     createMultipleHealthcarePartnerVehicle (authorizeRoles(onlyAdmin))
//   GET    /api/v1/partner-vehicle/:id                 getPartnerVehicleById       (authorizeRoles(allRead))
//   PUT    /api/v1/partner-vehicle/:id                 updatePartnerVehicle        (authorizeRoles(onlyAdmin))
//   DELETE /api/v1/partner-vehicle/:id                 deletePartnerVehicle        (authorizeRoles(onlyAdmin))
//
// Role-based authorizeRoles(...) calls from the original are enforced below
// via ../rbac's assertRole (allRead / onlyAdmin, matching the routes above
// exactly) — see rbac.ts's header comment for why this checks
// AuthData.role's real vocabulary rather than authorizeRoles.ts's own
// (never-actually-applied) Title-Case role-name list.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { assertRole, allRead, onlyAdmin } from "../rbac";
import * as service from "./partner-vehicle.service";
import type {
  CreateMultipleHealthcarePartnerVehicleRequest,
  CreateMultipleHealthcarePartnerVehicleResponse,
  CreatePartnerVehicleRequest,
  CreatePartnerVehicleResponse,
  DeletePartnerVehicleRequest,
  DeletePartnerVehicleResponse,
  GetAllPartnerVehiclesRequest,
  GetAllPartnerVehiclesResponse,
  GetPartnerVehicleByIdRequest,
  GetPartnerVehicleByIdResponse,
  GetPartnerVehicleExportExcelRequest,
  GetPartnerVehicleExportExcelResponse,
  UpdatePartnerVehicleRequest,
  UpdatePartnerVehicleResponse,
} from "./partner-vehicle.types";

export const getAllPartnerVehicles = api(
  { method: "GET", path: "/api/v1/partner-vehicle", auth: true, expose: true },
  async (req: GetAllPartnerVehiclesRequest): Promise<GetAllPartnerVehiclesResponse> => {
    const { entityId, entityTag, role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getAllPartnerVehicles({
      ...req,
      transporterId: entityId,
      entityTag,
    });
    return { status: "success", data };
  },
);

export const getPartnerVehicleExportExcel = api(
  { method: "GET", path: "/api/v1/partner-vehicle/export", auth: true, expose: true },
  async (
    req: GetPartnerVehicleExportExcelRequest,
  ): Promise<GetPartnerVehicleExportExcelResponse> => {
    const { entityId, entityTag, role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getPartnerVehicleExportExcel({
      ...req,
      transporterId: entityId,
      entityTag,
      // Original derives lang from the `accept-language` header, defaulting to
      // 'id'. Not yet exposed on AuthData/Header params for this endpoint —
      // defaulted to 'id' here, matching the original's fallback.
      lang: "id",
    });
    return { status: "success", data };
  },
);

export const createPartnerVehicle = api(
  { method: "POST", path: "/api/v1/partner-vehicle", auth: true, expose: true },
  async (req: CreatePartnerVehicleRequest): Promise<CreatePartnerVehicleResponse> => {
    const { userID, entityId, role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.createPartnerVehicle({
      ...req,
      createdBy: userID,
      transporterId: entityId,
    });
    return { status: "success", data };
  },
);

export const createMultipleHealthcarePartnerVehicle = api(
  { method: "POST", path: "/api/v1/partner-vehicle/bulk-healthcare", auth: true, expose: true },
  async (
    req: CreateMultipleHealthcarePartnerVehicleRequest,
  ): Promise<CreateMultipleHealthcarePartnerVehicleResponse> => {
    const { userID, entityId, role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.createMultipleHealthcarePartnerVehicle({
      ...req,
      createdBy: userID,
      transporterId: entityId,
    });
    return { status: "success", data };
  },
);

export const getPartnerVehicleById = api(
  { method: "GET", path: "/api/v1/partner-vehicle/:id", auth: true, expose: true },
  async (req: GetPartnerVehicleByIdRequest): Promise<GetPartnerVehicleByIdResponse> => {
    const { role } = getAuthData()!;
    assertRole(role, allRead);
    const data = await service.getPartnerVehicleById(req.id);
    return { status: "success", data };
  },
);

export const updatePartnerVehicle = api(
  { method: "PUT", path: "/api/v1/partner-vehicle/:id", auth: true, expose: true },
  async (req: UpdatePartnerVehicleRequest): Promise<UpdatePartnerVehicleResponse> => {
    const { userID, role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.updatePartnerVehicle({ ...req, updatedBy: userID });
    return { status: "success", data };
  },
);

export const deletePartnerVehicle = api(
  { method: "DELETE", path: "/api/v1/partner-vehicle/:id", auth: true, expose: true },
  async (req: DeletePartnerVehicleRequest): Promise<DeletePartnerVehicleResponse> => {
    const { role } = getAuthData()!;
    assertRole(role, onlyAdmin);
    const data = await service.deletePartnerVehicle({ id: req.id });
    return { status: "success", data };
  },
);
