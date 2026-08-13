// Routes — mirrors apps/wms-service's wasteBageQrCodeRoutes.ts [sic, "Bage" is
// a real typo in the original filename] (mounted at /waste-bag-qrcode,
// matching v1Router.use('/waste-bag-qrcode', wasteBagQrCodeRoutes)):
//
//   GET    /api/v1/waste-bag-qrcode       getAllWasteBagQrCodes  (role: allRead)
//   POST   /api/v1/waste-bag-qrcode       createWasteBagQrCode   (role: onlyAdmin)
//   GET    /api/v1/waste-bag-qrcode/:id   getWasteBagQrCodeById  (role: allRead)
//   PUT    /api/v1/waste-bag-qrcode/:id   updateWasteBagQrCode   (role: onlyAdmin)
//   DELETE /api/v1/waste-bag-qrcode/:id   deleteWasteBagQrCode   (role: onlyAdmin)
//
// Role-based authorization (allRead / onlyAdmin) isn't enforced yet — same
// known gap as every other ported module.
//
// IMPORTANT — `:id` means two different things across this route family, all
// preserved verbatim from the original (see waste-bag-qr-code.types.ts for
// details): GET and PUT treat `:id` as the qrCode string; DELETE treats it as
// the numeric primary key.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-bag-qr-code.service";
import type {
  GetWasteBagQrCodeByIdRequest,
  GetWasteBagQrCodeByIdResponse,
  GetAllWasteBagQrCodeRequest,
  GetAllWasteBagQrCodeResponse,
  CreateWasteBagQrCodeRequest,
  CreateWasteBagQrCodeResponse,
  UpdateWasteBagQrCodeRequest,
  UpdateWasteBagQrCodeResponse,
  DeleteWasteBagQrCodeRequest,
  DeleteWasteBagQrCodeResponse,
} from "./waste-bag-qr-code.types";

export const getAllWasteBagQrCodes = api(
  { method: "GET", path: "/api/v1/waste-bag-qrcode", auth: true, expose: true },
  async (req: GetAllWasteBagQrCodeRequest): Promise<GetAllWasteBagQrCodeResponse> => {
    const { entityId } = getAuthData()!;
    // Original: `entity_id !== undefined ? entity_id : req.user?.entity.id`
    // — an explicit query param overrides the caller's own entity.
    const effectiveEntityId = req.entity_id !== undefined ? Number(req.entity_id) : entityId;
    const data = await service.getAllWasteBagQrCode({
      limit: req.limit,
      page: req.page,
      entityId: effectiveEntityId,
      search: req.search,
    });
    return { status: "success", data };
  }
);

export const createWasteBagQrCode = api(
  { method: "POST", path: "/api/v1/waste-bag-qrcode", auth: true, expose: true },
  async (req: CreateWasteBagQrCodeRequest): Promise<CreateWasteBagQrCodeResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteBagQrCode(req.items, userID);
    return { status: "success", data };
  }
);

export const getWasteBagQrCodeById = api(
  { method: "GET", path: "/api/v1/waste-bag-qrcode/:id", auth: true, expose: true },
  async (req: GetWasteBagQrCodeByIdRequest): Promise<GetWasteBagQrCodeByIdResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getWasteBagQrCodeById(req.id, entityId);
    return { status: "success", data };
  }
);

export const updateWasteBagQrCode = api(
  { method: "PUT", path: "/api/v1/waste-bag-qrcode/:id", auth: true, expose: true },
  async (req: UpdateWasteBagQrCodeRequest): Promise<UpdateWasteBagQrCodeResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.updateWasteBagQrCode({
      id: req.id,
      healthcareFacilityId: entityId,
      wasteSourceId: req.wasteSourceId,
      wasteClassificationId: req.wasteClassificationId,
      qrCode: req.qrCode,
    });
    return { status: "success", data };
  }
);

export const deleteWasteBagQrCode = api(
  { method: "DELETE", path: "/api/v1/waste-bag-qrcode/:id", auth: true, expose: true },
  async (req: DeleteWasteBagQrCodeRequest): Promise<DeleteWasteBagQrCodeResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deleteWasteBagQrCode(req.id, userNumericId);
    return { status: "success", data };
  }
);
