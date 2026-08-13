// Routes — mirrors apps/wms-service's partnershipRoutes.ts (mounted at
// /partnership, matching v1Router.use('/partnership', ...)):
//
//   GET    /api/v1/partnership                     getAllPartnerships              (authorizeRoles(allRead))
//   GET    /api/v1/partnership/multiple-transporter getHasMultiplePartnership       (authorizeRoles(allRead))
//   GET    /api/v1/partnership/thirdparty           getPartnershipByThirdPartyAdmin (authorizeRoles(allRead))
//   GET    /api/v1/partnership/third-parties        findOneThirdParty               (authorizeRoles(allRead))
//   GET    /api/v1/partnership/healthcare-thirdparty getHealthcareByThirdPartyAdmin  (authorizeRoles(allRead))
//   GET    /api/v1/partnership/waste-classification  getWasteClassificationByHealthcare (authorizeRoles(allRead))
//   GET    /api/v1/partnership/waste-classification-consumer-thirdparty
//                                                    getWasteClassificationByConsumerIdAndProviderId (authorizeRoles(allRead))
//   POST   /api/v1/partnership                      createPartnership               (authorizeRoles(onlyAdmin))
//   GET    /api/v1/partnership/:id                  getPartnershipById              (authorizeRoles(allRead))
//   PUT    /api/v1/partnership/:id                  updatePartnership               (authorizeRoles(onlyAdmin))
//   DELETE /api/v1/partnership/:id                  deletePartnership               (authorizeRoles(onlyAdmin))
//   POST   /api/v1/partnership/:id/status           updateStatus                    (pre-existing, preserved)
//
// Role-based authorizeRoles(...) gating from the original is represented as
// a documented no-op, same as every other module in this domain
// (partner-vehicle / partnership-operator-map) — see partnership/rbac.ts's
// header comment: the original's own authorizeRoles.ts never actually
// enforces anything either.

import { api, APIError, ErrCode } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./partnership.service";
import type { ScheduledEventMetadata } from "../../messaging/topics";
import type {
  CreatePartnershipRequest,
  CreatePartnershipResponse,
  DeletePartnershipRequest,
  DeletePartnershipResponse,
  FindOneThirdPartyRequest,
  FindOneThirdPartyResponse,
  GetAllPartnershipsRequest,
  GetAllPartnershipsResponse,
  GetHasMultiplePartnershipRequest,
  GetHasMultiplePartnershipResponse,
  GetHealthcareByThirdPartyAdminResponse,
  GetPartnershipByIdRequest,
  GetPartnershipByIdResponse,
  GetPartnershipByThirdPartyAdminRequest,
  GetPartnershipByThirdPartyAdminResponse,
  GetWasteClassificationByConsumerIdAndProviderIdRequest,
  GetWasteClassificationByConsumerIdAndProviderIdResponse,
  GetWasteClassificationByHealthcareRequest,
  GetWasteClassificationByHealthcareResponse,
  UpdatePartnershipRequest,
  UpdatePartnershipResponse,
  UpdatePartnershipStatusRequest,
  UpdatePartnershipStatusResponse,
} from "./partnership.types";

const ALLOWED_HOSPITAL_ENTITY_TYPES = ["healthcare_facility", "regency", "province", "central"];

export const getAllPartnerships = api(
  { method: "GET", path: "/api/v1/partnership", auth: true, expose: true },
  async (req: GetAllPartnershipsRequest): Promise<GetAllPartnershipsResponse> => {
    // Original: `isSuperAdmin ? 'super-admin' : allowedTypes.includes(entityType) ?
    // 'hospital' : 'third-party'` — entityTypeName mirrors req.user.entity.entity_type.name.
    const { entityId, entityTag, isSuperAdmin, entityTypeName } = getAuthData()!;
    let tag = "third-party";
    if (isSuperAdmin) {
      tag = "super-admin";
    } else if (ALLOWED_HOSPITAL_ENTITY_TYPES.includes(entityTypeName)) {
      tag = "hospital";
    }
    const data = await service.getAllPartnerships({ ...req, entityId, entityTag: entityTag || tag });
    return { status: "success", data };
  },
);

export const getHasMultiplePartnership = api(
  { method: "GET", path: "/api/v1/partnership/multiple-transporter", auth: true, expose: true },
  async (req: GetHasMultiplePartnershipRequest): Promise<GetHasMultiplePartnershipResponse> => {
    const { entityId } = getAuthData()!;
    const healthcareFacilityId = req.healthcareFacilityId ?? entityId;
    const wasteClassificationIds = String(req.wasteClassificationId ?? "")
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => id > 0 && !Number.isNaN(id));
    const data = await service.getHasMultiplePartnership({
      healthcareFacilityId,
      wasteClassificationIds,
    });
    return { status: "success", data };
  },
);

export const getPartnershipByThirdPartyAdmin = api(
  { method: "GET", path: "/api/v1/partnership/thirdparty", auth: true, expose: true },
  async (_req: GetPartnershipByThirdPartyAdminRequest): Promise<GetPartnershipByThirdPartyAdminResponse> => {
    const { entityId, entityTypeName, tag } = getAuthData()!;
    let entityTag = tag;
    if (ALLOWED_HOSPITAL_ENTITY_TYPES.includes(entityTypeName)) {
      entityTag = "hospital";
    }
    const data = await service.getPartnershipByThirdPartyAdmin({ entityId, entityTag });
    return { status: "success", data };
  },
);

export const findOneThirdParty = api(
  { method: "GET", path: "/api/v1/partnership/third-parties", auth: true, expose: true },
  async (req: FindOneThirdPartyRequest): Promise<FindOneThirdPartyResponse> => {
    const { entityId } = getAuthData()!;
    const wasteClassificationIds = String(req.wasteClassificationId ?? "")
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => id > 0 && !Number.isNaN(id));
    const data = await service.findOneThirdParty({
      healthcareFacilityId: req.healthcareFacilityId ?? entityId,
      transporterId: Number(req.transporterId),
      wasteClassificationIds,
    });
    return { status: "success", data };
  },
);

export const getHealthcareByThirdPartyAdmin = api(
  { method: "GET", path: "/api/v1/partnership/healthcare-thirdparty", auth: true, expose: true },
  async (): Promise<GetHealthcareByThirdPartyAdminResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getHealthcareByThirdPartyAdmin(entityId);
    return { status: "success", data };
  },
);

export const getWasteClassificationByHealthcare = api(
  { method: "GET", path: "/api/v1/partnership/waste-classification", auth: true, expose: true },
  async (req: GetWasteClassificationByHealthcareRequest): Promise<GetWasteClassificationByHealthcareResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getWasteClassificationByHealthcare({
      consumerId: req.consumerId,
      providerId: entityId,
      isSameCompany: req.isSameCompany,
    });
    return { status: "success", data };
  },
);

export const getWasteClassificationByConsumerIdAndProviderId = api(
  {
    method: "GET",
    path: "/api/v1/partnership/waste-classification-consumer-thirdparty",
    auth: true,
    expose: true,
  },
  async (
    req: GetWasteClassificationByConsumerIdAndProviderIdRequest,
  ): Promise<GetWasteClassificationByConsumerIdAndProviderIdResponse> => {
    const { entityId } = getAuthData()!;
    const data = await service.getWasteClassificationByConsumerIdAndProviderId({
      limit: req.limit,
      page: req.page,
      providerId: req.providerId,
      consumerId: req.consumerId ?? entityId,
    });
    return { status: "success", data };
  },
);

export const createPartnership = api(
  { method: "POST", path: "/api/v1/partnership", auth: true, expose: true },
  async (req: CreatePartnershipRequest): Promise<CreatePartnershipResponse> => {
    const { userID, entityId, providerType } = getAuthData()!;
    const data = await service.createPartnership({
      ...req,
      createdBy: userID,
      // Mirrors the original: `req.user?.providerType ? req.user?.entity.id : null`.
      transporterId: providerType ? entityId : undefined,
    });
    return { status: "success", data };
  },
);

export const getPartnershipById = api(
  { method: "GET", path: "/api/v1/partnership/:id", auth: true, expose: true },
  async (req: GetPartnershipByIdRequest): Promise<GetPartnershipByIdResponse> => {
    const data = await service.getPartnershipById(req.id);
    return { status: "success", data };
  },
);

export const updatePartnership = api(
  { method: "PUT", path: "/api/v1/partnership/:id", auth: true, expose: true },
  async (req: UpdatePartnershipRequest): Promise<UpdatePartnershipResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.updatePartnership({ ...req, updatedBy: userID });
    if (data === null) {
      // Controller: `if (data === null) res.fail('Partnership not found')` — no flag -> 400.
      throw new APIError(ErrCode.FailedPrecondition, "Partnership not found");
    }
    return { status: "success", data };
  },
);

export const deletePartnership = api(
  { method: "DELETE", path: "/api/v1/partnership/:id", auth: true, expose: true },
  async (req: DeletePartnershipRequest): Promise<DeletePartnershipResponse> => {
    const { userNumericId } = getAuthData()!;
    const data = await service.deletePartnership({ id: req.id, deletedBy: userNumericId });
    return { status: "success", data };
  },
);

// Pre-existing endpoint — preserved verbatim, not part of this pass's CRUD additions.
export const updateStatus = api(
  { method: "POST", path: "/api/v1/partnership/:id/status", auth: true, expose: true },
  async (req: UpdatePartnershipStatusRequest): Promise<UpdatePartnershipStatusResponse> => {
    const { userID } = getAuthData()!;
    const result = await service.updateStatus({ ...req, createdBy: userID });
    return { status: "success", data: result };
  },
);

// Internal-only (no method/path/expose) — callable from other services via
// ~encore/clients, not over public HTTP. scheduled-event-dispatcher's entry
// point into this domain's expireContractIfDue, so that cross-service hop is
// a real Encore RPC (shows up in the trace/service graph) instead of a plain
// cross-service TypeScript import.
export const expireContractIfDue = api(
  {},
  async (req: { scheduledAt: string; metadata: ScheduledEventMetadata }): Promise<{ didExpire: boolean }> => {
    const didExpire = await service.expireContractIfDue(req.scheduledAt, req.metadata);
    return { didExpire };
  }
);
