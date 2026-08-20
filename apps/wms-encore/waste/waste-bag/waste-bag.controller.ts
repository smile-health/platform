// Routes — mirrors apps/wms-service's wasteRoutes.ts (mounted at /waste,
// matching v1Router.use('/waste', wasteRoutes) in routes/index.ts). Most
// Excel export routes (/transactions/export, /tracking-by-characteristics/export,
// /tracking-by-waste-source/export, /waste-group/export, /waste-external/export,
// /logbook/export) are served by a DIFFERENT controller in the original
// (wasteTrackingExportExcelController.ts / logBookExportExcelController.ts)
// and remain out of scope for this module — not ported here, not invented
// as stubs. /waste-tracking-all/export is the one exception: it's ported
// below as a raw binary endpoint (see getWasteTrackingAllExportExcel),
// same api.raw pattern as waste-bag-record.controller.ts's analogous export.
//
//   GET    /api/v1/waste                                                  getAllWasteBags
//   GET    /api/v1/waste/transactions                                     getAllTransactionWasteBags
//   GET    /api/v1/waste/tracking-by-characteristics                      getWasteBagSummaryByCharacteristics
//   GET    /api/v1/waste/tracking-by-waste-source                        getWasteSourceSummary
//   GET    /api/v1/waste/waste-tracking-all/export                       getWasteTrackingAllExportExcel
//   GET    /api/v1/waste/logbook                                          getWasteBagLogBook
//   GET    /api/v1/waste/transaction-history                             getWasteBagHistory
//   POST   /api/v1/waste/follow-up-treatment                             followUpTreatmentList
//   GET    /api/v1/waste/waste-group-details/:wasteGroupId               getWasteGroupDetails
//   GET    /api/v1/waste/waste-bag-internal-treatment-details/:wasteBagQrCodeId  getWasteBagInternalTreatmentDetails
//   POST   /api/v1/waste                                                  createWasteBag
//   PATCH  /api/v1/waste/temporary-store                                  temporaryStoreWasteBags
//   PATCH  /api/v1/waste/cold-store                                       coldStoreWasteBags
//   PATCH  /api/v1/waste/internal_landfill                                internalLandfillWasteBags
//   PATCH  /api/v1/waste/sterilise                                        steriliseWasteBags
//   PATCH  /api/v1/waste/incinerate                                       incinerateWasteBags
//   PATCH  /api/v1/waste/follow-up/transport-request                      followUpTransportRequest
//   POST   /api/v1/waste/handover/transport-request                       handoverTransportRequest
//   PATCH  /api/v1/waste/follow-up/transport-external-request             followUpTransportExternalRequest
//   POST   /api/v1/waste/handover/transport-external-request              handoverTransportExternalRequest
//   POST   /api/v1/waste/pick-up/transport-external-request               pickUpTransportExternalRequest
//   POST   /api/v1/waste/handover/treatment-external-request              handoverTreatmentExternalRequest
//   POST   /api/v1/waste/receiving/treatment-external-request             receivingTreatmentExternalRequest
//   GET    /api/v1/waste/:id                                              getWasteBagById
//
// Role-based authorization (allRead/onlyAdmin) isn't enforced yet — same
// known gap as every other ported module.
//
// NOTE ON THE EARLIER ILLUSTRATIVE ENDPOINT: this file previously exposed
// POST /api/v1/waste-bag/:id/status as a standalone demo of the
// wasteStatusUpdate publish. That route has been removed — it never existed
// in the original (there is no dedicated status-update endpoint; status
// changes are side effects of the real lifecycle actions below). The
// publish call it demonstrated now lives inside each real action, via
// waste-bag.service.ts's publishStatusChange/publishStatusChangeForBags
// helpers — see that file's top-of-file comment for the full explanation.

import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import * as service from "./waste-bag.service";
import type { ScheduledEventType, ScheduledEventMetadata } from "../../messaging/topics";
import type {
  GetAllWasteBagsRequest,
  GetAllWasteBagsResponse,
  GetWasteBagByIdRequest,
  GetWasteBagByIdResponse,
  CreateWasteBagRequest,
  CreateWasteBagResponse,
  BulkWasteBagQrCodeRequest,
  BulkActionResponse,
  TreatmentActionRequest,
  FollowUpTransportRequest,
  HandoverTransportRequest,
  PickUpTransportExternalRequest,
  HandoverTreatmentExternalRequest,
  ReceivingTreatmentExternalRequest,
  GroupActionResponse,
  GetAllTransactionWasteBagsRequest,
  GetAllTransactionWasteBagsResponse,
  WasteBagSummaryByCharacteristicsRequest,
  WasteBagSummaryByCharacteristicsResponse,
  WasteSourceSummaryRequest,
  WasteSourceSummaryResponse,
  WasteBagLogBookRequest,
  WasteBagLogBookResponse,
  WasteBagHistoryRequest,
  WasteBagHistoryResponse,
  WasteGroupDetailsRequest,
  WasteGroupDetailsResponse,
  WasteBagInternalTreatmentDetailsRequest,
  WasteBagInternalTreatmentDetailsResponse,
} from "./waste-bag.types";

export const getAllWasteBags = api(
  { method: "GET", path: "/api/v1/waste", auth: true, expose: true },
  async (req: GetAllWasteBagsRequest): Promise<GetAllWasteBagsResponse> => {
    // Mirrors getAllWasteController's entityTag/entityId resolution off
    // req.user.entity — allowedTypes (hospital/regency/province/central),
    // when the caller isn't a super_admin, are always folded to the
    // 'hospital' tag (matching the original's `entityTag = 'hospital'`
    // override) rather than their own literal entity type.
    const { entityId, entityTag, entityTypeName, isSuperAdmin } = getAuthData()!;
    const allowedTypes = ["healthcare_facility", "regency", "province", "central"];
    const resolvedEntityTag =
      allowedTypes.includes(entityTypeName) && !isSuperAdmin ? "hospital" : entityTag;
    const data = await service.getAllWasteBags({ ...req, entityTag: resolvedEntityTag, entityId });
    return { status: "success", data };
  }
);

export const getWasteBagById = api(
  { method: "GET", path: "/api/v1/waste/:id", auth: true, expose: true },
  async (req: GetWasteBagByIdRequest): Promise<GetWasteBagByIdResponse> => {
    const { entityId, entityTag, entityTypeName, isSuperAdmin } = getAuthData()!;
    const allowedTypes = ["healthcare_facility", "regency", "province", "central"];
    const resolvedEntityTag =
      allowedTypes.includes(entityTypeName) && !isSuperAdmin ? "hospital" : entityTag;
    const data = await service.getWasteBagById(req.id, { entityTag: resolvedEntityTag, entityId });
    return { status: "success", data };
  }
);

export const createWasteBag = api(
  { method: "POST", path: "/api/v1/waste", auth: true, expose: true },
  async (req: CreateWasteBagRequest): Promise<CreateWasteBagResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.createWasteBag({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const temporaryStoreWasteBags = api(
  { method: "PATCH", path: "/api/v1/waste/temporary-store", auth: true, expose: true },
  async (req: BulkWasteBagQrCodeRequest): Promise<BulkActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.temporaryStoreWasteBags({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const followUpTreatmentList = api(
  { method: "POST", path: "/api/v1/waste/follow-up-treatment", auth: true, expose: true },
  async (req: BulkWasteBagQrCodeRequest): Promise<BulkActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.followUpTreatmentList({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const coldStoreWasteBags = api(
  { method: "PATCH", path: "/api/v1/waste/cold-store", auth: true, expose: true },
  async (req: BulkWasteBagQrCodeRequest): Promise<BulkActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.coldStoreWasteBags({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const internalLandfillWasteBags = api(
  { method: "PATCH", path: "/api/v1/waste/internal_landfill", auth: true, expose: true },
  async (req: TreatmentActionRequest): Promise<{ status: "success"; data: boolean }> => {
    const { userID } = getAuthData()!;
    const data = await service.internalLandfillWasteBags({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const steriliseWasteBags = api(
  { method: "PATCH", path: "/api/v1/waste/sterilise", auth: true, expose: true },
  async (req: TreatmentActionRequest): Promise<{ status: "success"; data: boolean }> => {
    const { userID } = getAuthData()!;
    const data = await service.steriliseWasteBags({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const incinerateWasteBags = api(
  { method: "PATCH", path: "/api/v1/waste/incinerate", auth: true, expose: true },
  async (req: TreatmentActionRequest): Promise<{ status: "success"; data: boolean }> => {
    const { userID } = getAuthData()!;
    const data = await service.incinerateWasteBags({ ...req, createdBy: userID });
    return { status: "success", data };
  }
);

export const followUpTransportRequest = api(
  { method: "PATCH", path: "/api/v1/waste/follow-up/transport-request", auth: true, expose: true },
  async (req: FollowUpTransportRequest): Promise<BulkActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.followUpTransportRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const handoverTransportRequest = api(
  { method: "POST", path: "/api/v1/waste/handover/transport-request", auth: true, expose: true },
  async (req: HandoverTransportRequest): Promise<GroupActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.handoverTransportRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const followUpTransportExternalRequest = api(
  { method: "PATCH", path: "/api/v1/waste/follow-up/transport-external-request", auth: true, expose: true },
  async (req: FollowUpTransportRequest): Promise<BulkActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.followUpTransportExternalRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const handoverTransportExternalRequest = api(
  { method: "POST", path: "/api/v1/waste/handover/transport-external-request", auth: true, expose: true },
  async (req: HandoverTransportRequest): Promise<GroupActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.handoverTransportExternalRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const pickUpTransportExternalRequest = api(
  { method: "POST", path: "/api/v1/waste/pick-up/transport-external-request", auth: true, expose: true },
  async (req: PickUpTransportExternalRequest): Promise<GroupActionResponse> => {
    // Mirrors the original: transporterOperatorId = req.user?.user_uuid_wms,
    // transporterId = req.user?.entity.id — both from the caller's own auth
    // context, not the request body.
    const { userID, entityId } = getAuthData()!;
    const data = await service.pickUpTransportExternalRequest({
      ...req,
      updatedBy: userID,
      transporterId: entityId,
      transporterOperatorId: userID,
    });
    return { status: "success", data };
  }
);

export const handoverTreatmentExternalRequest = api(
  { method: "POST", path: "/api/v1/waste/handover/treatment-external-request", auth: true, expose: true },
  async (req: HandoverTreatmentExternalRequest): Promise<GroupActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.handoverTreatmentExternalRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const receivingTreatmentExternalRequest = api(
  { method: "POST", path: "/api/v1/waste/receiving/treatment-external-request", auth: true, expose: true },
  async (req: ReceivingTreatmentExternalRequest): Promise<GroupActionResponse> => {
    const { userID } = getAuthData()!;
    const data = await service.receivingTreatmentExternalRequest({ ...req, updatedBy: userID });
    return { status: "success", data };
  }
);

export const getAllTransactionWasteBags = api(
  { method: "GET", path: "/api/v1/waste/transactions", auth: true, expose: true },
  async (req: GetAllTransactionWasteBagsRequest): Promise<GetAllTransactionWasteBagsResponse> => {
    const data = await service.getAllTransactionWasteBags(req);
    return { status: "success", data };
  }
);

export const getWasteBagSummaryByCharacteristics = api(
  { method: "GET", path: "/api/v1/waste/tracking-by-characteristics", auth: true, expose: true },
  async (
    req: WasteBagSummaryByCharacteristicsRequest
  ): Promise<WasteBagSummaryByCharacteristicsResponse> => {
    const data = await service.getWasteBagSummaryByCharacteristics(req);
    return { status: "success", data };
  }
);

export const getWasteSourceSummary = api(
  { method: "GET", path: "/api/v1/waste/tracking-by-waste-source", auth: true, expose: true },
  async (req: WasteSourceSummaryRequest): Promise<WasteSourceSummaryResponse> => {
    const data = await service.getWasteSourceSummary(req);
    return { status: "success", data };
  }
);

// Binary .xlsx response — not representable by api()'s JSON request/response
// types, so this is ported as a raw endpoint, same pattern as
// waste-bag-record.controller.ts's getWasteRecordCharacteristicsSummaryExportExcel
// and dashboard-activity.controller.ts's analogous export. Query params are
// parsed manually off the URL; see waste-bag.service.ts's exportWasteTrackingAll
// for the full port notes (3-sheet workbook, role/type sheet-count gate, the
// entity.type -> AuthData gap).
export const getWasteTrackingAllExportExcel = api.raw(
  { method: "GET", path: "/api/v1/waste/waste-tracking-all/export", auth: true, expose: true },
  async (req, resp) => {
    try {
      const url = new URL(req.url ?? "", "http://internal");
      const q = url.searchParams;
      const numOrUndefined = (v: string | null) =>
        v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;

      const { entityId, entityTypeName, isSuperAdmin, role } = getAuthData()!;
      // Original: `let resolvedHealthcareId = healthcareFacilityId; if
      // (entityId && entityType === 'healthcare_facility' && !isSuperAdmin)
      // resolvedHealthcareId = entityId.toString();` — same override pattern
      // as waste-bag-record's export, scoped to just 'healthcare_facility'
      // here (matching the original's own narrower check for this endpoint).
      let resolvedHealthcareId = numOrUndefined(q.get("healthcareFacilityId"));
      if (entityId && entityTypeName === "healthcare_facility" && !isSuperAdmin) {
        resolvedHealthcareId = entityId;
      }

      const { buffer, filename } = await service.exportWasteTrackingAll({
        startDate: q.get("startDate") ?? undefined,
        endDate: q.get("endDate") ?? undefined,
        provinceId: numOrUndefined(q.get("provinceId")),
        regencyId: numOrUndefined(q.get("regencyId")),
        healthcareFacilityId: resolvedHealthcareId,
        role,
      });

      resp.writeHead(200, {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": service.buildContentDispositionForWasteTrackingExport(filename),
        "Cache-Control": "no-store",
        "Content-Length": buffer.length.toString(),
      });
      resp.end(buffer);
    } catch (error) {
      // Mirrors the original controller's outer catch -> res.error(...) ->
      // 500 "error" envelope — errorEnvelope only intercepts api() handlers,
      // not api.raw, so this raw handler builds the same
      // {status:"error", ...} shape by hand, same as
      // waste-bag-record.controller.ts's analogous raw export.
      const message = error instanceof Error ? error.message : String(error);
      const body = JSON.stringify({ status: "error", message, data: null });
      resp.writeHead(500, { "Content-Type": "application/json" });
      resp.end(body);
    }
  }
);

export const getWasteBagLogBook = api(
  { method: "GET", path: "/api/v1/waste/logbook", auth: true, expose: true },
  async (req: WasteBagLogBookRequest): Promise<WasteBagLogBookResponse> => {
    const data = await service.getWasteBagLogBook(req);
    return { status: "success", data };
  }
);

export const getWasteBagHistory = api(
  { method: "GET", path: "/api/v1/waste/transaction-history", auth: true, expose: true },
  async (req: WasteBagHistoryRequest): Promise<WasteBagHistoryResponse> => {
    const data = await service.getWasteBagHistory(req);
    return { status: "success", data };
  }
);

export const getWasteGroupDetails = api(
  { method: "GET", path: "/api/v1/waste/waste-group-details/:wasteGroupId", auth: true, expose: true },
  async (req: WasteGroupDetailsRequest): Promise<WasteGroupDetailsResponse> => {
    const data = await service.getWasteGroupDetails(req.wasteGroupId);
    return { status: "success", data };
  }
);

export const getWasteBagInternalTreatmentDetails = api(
  {
    method: "GET",
    path: "/api/v1/waste/waste-bag-internal-treatment-details/:wasteBagQrCodeId",
    auth: true,
    expose: true,
  },
  async (
    req: WasteBagInternalTreatmentDetailsRequest
  ): Promise<WasteBagInternalTreatmentDetailsResponse> => {
    const data = await service.getWasteBagInternalTreatmentDetails(req.wasteBagQrCodeId);
    return { status: "success", data };
  }
);

// Internal-only (no method/path/expose) — callable from other services via
// ~encore/clients, not over public HTTP. This is scheduled-event-dispatcher's
// entry point into this domain's advanceScheduledWasteBagEvent, so that
// cross-service hop is a real Encore RPC (shows up in the trace/service graph)
// instead of a plain cross-service TypeScript import.
export const advanceScheduledWasteBagEvent = api(
  {},
  async (req: { eventType: ScheduledEventType; metadata: ScheduledEventMetadata }): Promise<void> => {
    await service.advanceScheduledWasteBagEvent(req.eventType, req.metadata);
  }
);
