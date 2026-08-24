// Routes — mirrors apps/wms-service's assetManufacturerRoutes.ts, mounted at
// `/asset` (v1Router.use('/asset', assetManufacturer) in routes/index.ts —
// note this is NOT `/asset-manufacturer`, preserved verbatim):
//
//   GET    /api/v1/asset       getAllAssetManufacturers  (role: allRead)
//   POST   /api/v1/asset       createAssetManufacturer   (role: onlySuperAdmin)
//   GET    /api/v1/asset/:id   getAssetManufacturerById  (role: allRead)
//   PUT    /api/v1/asset/:id   updateAsetManufacturer    (role: onlySuperAdmin)
//   DELETE /api/v1/asset/:id   deleteManufacturer        (no role check in the
//                              original — every other verb on this router has
//                              an authorizeRoles(...) middleware except this
//                              one; preserved as a gap, not added here either)
//
// Role-based authorization isn't enforced — not a gap, since the original doesn't enforce it either (see partnership/rbac.ts), same as every other
// ported module; authorizeRoles.ts's role check itself has a documented bug
// upstream (see the migration plan).

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./asset-manufacturer.service";
import type {
  GetAssetManufacturerByIdRequest,
  GetAssetManufacturerByIdResponse,
  GetAllAssetManufacturersRequest,
  GetAllAssetManufacturersResponse,
  CreateAssetManufacturerRequest,
  CreateAssetManufacturerResponse,
  UpdateAssetManufacturerRequest,
  UpdateAssetManufacturerResponse,
  DeleteAssetManufacturerRequest,
  DeleteAssetManufacturerResponse,
} from "./asset-manufacturer.types";

export const getAllAssetManufacturers = api(
  { method: "GET", path: "/api/v1/asset", auth: true, expose: true },
  async (req: GetAllAssetManufacturersRequest): Promise<GetAllAssetManufacturersResponse> => {
    const data = await service.getAllAssetManufacturers(req);
    return { status: "success", data };
  }
);

export const createAssetManufacturer = api(
  { method: "POST", path: "/api/v1/asset", auth: true, expose: true },
  async (req: CreateAssetManufacturerRequest): Promise<CreateAssetManufacturerResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createAssetManufacturer({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const getAssetManufacturerById = api(
  { method: "GET", path: "/api/v1/asset/:id", auth: true, expose: true },
  async (req: GetAssetManufacturerByIdRequest): Promise<GetAssetManufacturerByIdResponse> => {
    const data = await service.getAssetManufacturerById(req.id);
    return { status: "success", data };
  }
);

export const updateAsetManufacturer = api(
  { method: "PUT", path: "/api/v1/asset/:id", auth: true, expose: true },
  async (req: UpdateAssetManufacturerRequest): Promise<UpdateAssetManufacturerResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updateAssetManufacturer({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const deleteManufacturer = api(
  { method: "DELETE", path: "/api/v1/asset/:id", auth: true, expose: true },
  async (req: DeleteAssetManufacturerRequest): Promise<DeleteAssetManufacturerResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteAssetManufacturer(req.id, userNumericId);
    return { status: "success", data };
  }
);
