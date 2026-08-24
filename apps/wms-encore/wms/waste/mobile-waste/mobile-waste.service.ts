import { APIError, ErrCode } from "encore.dev/api";
import * as wasteBagService from "../waste-bag/waste-bag.service";
import * as wasteBagRepo from "../waste-bag/waste-bag.repository";
import * as mobileWasteRepo from "./mobile-waste.repository";
import {
  mobileFollowUpTreatmentSchema,
  mobileReceivingTreatmentExternalSchema,
  mobileWasteFollowUpSchema,
  mobileWastePostTreatmentSchema,
} from "./mobile-waste.schema";
import type {
  MobileWasteFollowUpActionType,
  MobileWastePostTreatmentActionType,
} from "./mobile-waste.types";
import type { WasteStatus } from "../waste-bag/waste-bag.types";

// ---------------------------------------------------------------------------
// POST /api/v1/mobile/follow-up-treatment — mirrors followUpTreatmentListController
// -> ListFollowUpTreatmentUseCase, which is a thin read (finds the bags, returns
// them) rather than a mutation; already covered by
// ../waste-bag/waste-bag.service.ts's followUpTreatmentList.
export async function followUpTreatmentList(input: {
  wasteBagQrCodeIds: string[];
  updatedBy: string;
}) {
  const parsed = mobileFollowUpTreatmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  return wasteBagService.followUpTreatmentList(input);
}

// ---------------------------------------------------------------------------
// GET /api/v1/mobile/detail — mirrors getWasteBagDetailController: same
// underlying GetAllWasteBagUseCase as getAllWasteBagController below, but
// flattened down to a single record (or null) instead of a paginated list —
// that flattening is the one bit of mobile-specific shaping, kept here.
//
// Deviation: the original additionally derives entityTag from the caller's
// entity_type / super_admin role (forcing 'hospital' for a set of entity
// types unless the caller is super_admin) and filters by sourceType /
// wasteTypeId / wasteGroupId / wasteCharacteristicsId — none of which have a
// column/filter in waste-bag.repository.ts's findPaginated. Deferred, same
// gap already documented in mobile-waste.types.ts.
export async function getWasteBagDetail(input: {
  limit?: number;
  page?: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: number[];
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
}) {
  const result = await wasteBagService.getAllWasteBags({ ...input, limit: input.limit ?? 1, page: input.page ?? 1 });
  return result.data.length > 0 ? result.data[0] : null;
}

// ---------------------------------------------------------------------------
// GET /api/v1/mobile — mirrors getAllWasteBagController, a straight
// pass-through onto GetAllWasteBagUseCase; already covered by
// ../waste-bag/waste-bag.service.ts's getAllWasteBags.
export async function getAllWasteBags(input: {
  limit?: number;
  page?: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: number[];
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
}) {
  return wasteBagService.getAllWasteBags(input);
}

// ---------------------------------------------------------------------------
// POST /api/v1/mobile/receiving-treatment-external — mirrors
// receievmentUpToTreatmentExternal -> ReceievmentTreatmentExternalWasteBagUseCase;
// already covered by ../waste-bag/waste-bag.service.ts's
// receivingTreatmentExternalRequest (same status transition, same
// WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL scheduled follow-up).
export async function receivingTreatmentExternal(input: {
  wasteBagQrCodeIds: string[];
  startTime?: string;
  endTime?: string;
  updatedBy: string;
}) {
  const parsed = mobileReceivingTreatmentExternalSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const startTime = parsed.data.startTime ?? new Date().toISOString();
  const endTime = parsed.data.endTime ?? new Date().toISOString();
  return wasteBagService.receivingTreatmentExternalRequest({
    wasteBagQrCodeIds: parsed.data.wasteBagQrCodeIds,
    startTime,
    endTime,
    updatedBy: input.updatedBy,
  });
}

// ---------------------------------------------------------------------------
// POST /api/v1/mobile/follow-up-action — mirrors mobileWasteFollowUpController's
// actionType switch. Each branch dispatches to the SAME lifecycle action the
// non-mobile /api/v1/waste routes use (already ported in
// ../waste-bag/waste-bag.service.ts) — no duplicated SQL/business logic here,
// just the mobile action-type routing.
//
// Deviation: the original's TRANSPORTER_* branches build a full
// TransportRequestDTO (transporterOperatorId, consumerId, provider-specific
// token/vehicle plumbing) and call out to an external transporter service via
// a bearer token forwarded from the request. That external call and the
// providerType string-mapping switch are simplified down to
// followUpTransportExternalRequest's (providerType, updatedBy) shape — same
// "cross-service lookups not yet wired" gap ../waste-bag/waste-bag.service.ts
// already documents for its own followUp*TransportRequest.
export async function mobileWasteFollowUp(input: {
  wasteBagQrCodeIds: string[];
  actionType: MobileWasteFollowUpActionType;
  startTime?: string;
  endTime?: string;
  transporterVehicleId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  updatedBy: string;
}) {
  const parsed = mobileWasteFollowUpSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const { wasteBagQrCodeIds, actionType, startTime, endTime, transporterVehicleId } = parsed.data;
  const updatedBy = input.updatedBy;

  switch (actionType) {
    case "TEMPORARY_STORAGE":
      return wasteBagService.temporaryStoreWasteBags({ wasteBagQrCodeIds, updatedBy });

    case "COLD_STORAGE": {
      const coldStoreEndTime = new Date();
      coldStoreEndTime.setDate(coldStoreEndTime.getDate() + 90);
      return wasteBagService.coldStoreWasteBags({
        wasteBagQrCodeIds,
        endTime: coldStoreEndTime.toISOString(),
        createdBy: updatedBy,
      });
    }

    case "DISINFECTION":
      if (!startTime || !endTime) {
        throw new APIError(ErrCode.InvalidArgument, "startTime and endTime are required");
      }
      return wasteBagService.steriliseWasteBags({
        wasteBagQrCodeIds,
        treatmentStartTime: startTime,
        treatmentEndTime: endTime,
        createdBy: updatedBy,
      });

    case "PYROLYSIS":
      if (!startTime || !endTime) {
        throw new APIError(ErrCode.InvalidArgument, "startTime and endTime are required");
      }
      return wasteBagService.incinerateWasteBags({
        wasteBagQrCodeIds,
        treatmentStartTime: startTime,
        treatmentEndTime: endTime,
        createdBy: updatedBy,
      });

    case "INTERNAL_LANDFILLER":
      if (!startTime || !endTime) {
        throw new APIError(ErrCode.InvalidArgument, "startTime and endTime are required");
      }
      return wasteBagService.internalLandfillWasteBags({
        wasteBagQrCodeIds,
        treatmentStartTime: startTime,
        treatmentEndTime: endTime,
        createdBy: updatedBy,
      });

    case "TRANSPORTER_LANDFILL":
    case "TRANSPORTER_GOVERNMENT":
    case "SPECIALIZED_TREATMENT_PROVIDER":
    case "TRANSPORTER_RECYCLER":
    case "TRANSPORTER_GOVERNMENT_WASTE_BANK":
    case "TRANSPORTER_TREATMENT":
      return wasteBagService.followUpTransportExternalRequest({
        wasteBagQrCodeIds,
        providerType: actionType,
        updatedBy,
        startTime,
        endTime,
        transporterVehicleId,
      } as Parameters<typeof wasteBagService.followUpTransportExternalRequest>[0]);

    default:
      // Zod's z.enum already rejects anything outside
      // MOBILE_WASTE_FOLLOW_UP_ACTION_TYPES before this switch is reached.
      throw new APIError(ErrCode.InvalidArgument, "Invalid actionType");
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/mobile/post-treatment — mirrors mobileWastePostTreatmentController
// -> PostTreatmentWasteBag.ts. The original's repo.postTreatment updates
// waste_status to an "_EXTERNAL"-flavoured target depending on schema, but
// LANDFILLED/RECYCLED/DISPOSED's notification branches are dead code (commented
// out) in the original itself — this port keeps the same scope: DISINFECTION/
// PYROLYSIS reuse the internal sterilise/incinerate transitions (closest
// available analog, same simplification the original's own dead code implies
// for the other three), and LANDFILLED/RECYCLED/DISPOSED apply a direct
// waste_status update via ../waste-bag/waste-bag.repository.ts's
// updateStatusByQrCodeIds without a scheduled follow-up (none existed for
// these three in the original either).
const POST_TREATMENT_STATUS: Record<MobileWastePostTreatmentActionType, WasteStatus> = {
  DISINFECTION: "STERILISED",
  PYROLYSIS: "INCINERATED",
  LANDFILLED: "LANDFILLED",
  RECYCLED: "RECYCLED",
  DISPOSED: "DISPOSED",
};

export async function mobileWastePostTreatment(input: {
  wasteBagQrCodeIds: string[];
  actionType: MobileWastePostTreatmentActionType;
  healthcareFacilityId: number;
  startTime?: string;
  endTime?: string;
  transporterVehicleId?: number;
  updatedBy: string;
}) {
  const parsed = mobileWastePostTreatmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const { wasteBagQrCodeIds, actionType, startTime, endTime } = parsed.data;
  const updatedBy = input.updatedBy;

  if (actionType === "DISINFECTION" || actionType === "PYROLYSIS") {
    if (!startTime || !endTime) {
      throw new APIError(ErrCode.InvalidArgument, "startTime and endTime are required");
    }
    const ok =
      actionType === "DISINFECTION"
        ? await wasteBagService.steriliseWasteBags({
            wasteBagQrCodeIds,
            treatmentStartTime: startTime,
            treatmentEndTime: endTime,
            createdBy: updatedBy,
          })
        : await wasteBagService.incinerateWasteBags({
            wasteBagQrCodeIds,
            treatmentStartTime: startTime,
            treatmentEndTime: endTime,
            createdBy: updatedBy,
          });
    if (!ok) {
      throw new APIError(ErrCode.FailedPrecondition, `Post treatment ${actionType} uncompleted`);
    }
    return { affected: wasteBagQrCodeIds.length };
  }

  const before = await wasteBagRepo.updateStatusByQrCodeIds(
    wasteBagQrCodeIds,
    POST_TREATMENT_STATUS[actionType],
    updatedBy,
    actionType === "DISPOSED" || actionType === "RECYCLED" || actionType === "LANDFILLED"
      ? { is_disposed: true }
      : {}
  );
  if (before.length === 0) {
    throw new APIError(ErrCode.FailedPrecondition, `Post treatment ${actionType} uncompleted`);
  }
  return { affected: before.length };
}

// ---------------------------------------------------------------------------
// GET /api/v1/mobile/report — mirrors reportWasteBagController, a fan-out of
// three already-ported summary queries in ../waste-bag/waste-bag.service.ts.
// Deviation: the original passes limit/page/startDate/endDate/false/entityId
// positionally to a "byWasteStatus" summary too — that one has no ported
// analog under waste-bag (only tracking-by-characteristics and
// tracking-by-waste-source exist), so the third leg here calls
// getWasteBagReportByStatus below instead (same underlying report-waste-status
// query the sibling endpoint uses), which is the closest available substitute.
export async function getWasteBagReport(input: {
  limit?: number;
  page?: number;
  startDate: string;
  endDate: string;
  healthcareFacilityId?: number;
}) {
  const [resultSummaryCharacteristic, resultSummaryWasteSource, resultSummaryWasteStatus] = await Promise.all([
    wasteBagService.getWasteBagSummaryByCharacteristics({
      wasteUpdateStart: input.startDate,
      wasteUpdateEnd: input.endDate,
      healthcareId: input.healthcareFacilityId,
    }),
    wasteBagService.getWasteSourceSummary({
      wasteUpdateStart: input.startDate,
      wasteUpdateEnd: input.endDate,
      healthcareId: input.healthcareFacilityId,
    }),
    mobileWasteRepo.findWasteBagReportByStatus({
      limit: input.limit && input.limit > 0 ? input.limit : 10,
      page: input.page && input.page > 0 ? input.page : 1,
      entityId: input.healthcareFacilityId,
      startDate: input.startDate,
      endDate: input.endDate,
    }),
  ]);

  return { resultSummaryCharacteristic, resultSummaryWasteSource, resultSummaryWasteStatus };
}

// ---------------------------------------------------------------------------
// GET /api/v1/mobile/report-waste-status — mirrors reportWasteBagByStatusController
// -> GetWasteBagByWasteStatusUseCase. See mobile-waste.repository.ts's
// findWasteBagReportByStatus for the audit-trail simplification.
export async function getWasteBagReportByStatus(input: {
  limit?: number;
  page?: number;
  startDate: string;
  endDate: string;
  healthcareFacilityId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteStatus?: string;
}) {
  return mobileWasteRepo.findWasteBagReportByStatus({
    limit: input.limit && input.limit > 0 ? input.limit : 10,
    page: input.page && input.page > 0 ? input.page : 1,
    entityId: input.healthcareFacilityId,
    startDate: input.startDate,
    endDate: input.endDate,
    wasteTypeId: input.wasteTypeId,
    wasteGroupId: input.wasteGroupId,
    wasteStatus: input.wasteStatus,
  });
}
