// Mirrors apps/wms-service's routes/mobile/wasteRoutes.ts + controllers/mobile/
// wasteController.ts + controllers/mobile/reportWasteBagController.ts, mounted
// at /api/v1/mobile/... (v1RouterMobile.use('/waste', wasteRoutes) is a red
// herring for the mount PATH here — v1RouterMobile itself is mounted at
// /api/v1/mobile in app.ts, and wasteRoutes is mounted at '/' relative to it
// per the task spec's expected prefixes, i.e. no extra `/waste` segment).
//
// Most of the underlying business logic (temporary-store/follow-up/transport/
// treatment/receiving) already lives in ../waste-bag/waste-bag.service.ts —
// these types only cover the mobile-specific request/response shapes that
// don't already have an analog there (report summaries, detail single-record
// shaping).

// POST /api/v1/mobile/follow-up-treatment
export interface MobileFollowUpTreatmentRequest {
  wasteBagQrCodeIds: string[];
}
export interface MobileFollowUpTreatmentResponse {
  status: "success";
  data: { affected: number };
}

// GET /api/v1/mobile/detail
export interface MobileWasteBagDetailRequest {
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
  // sourceType / wasteTypeId / wasteGroupId / wasteCharacteristicsId are
  // accepted by the original's getWasteBagDetailController query but have no
  // corresponding filter in waste-bag.repository.ts's findPaginated — same
  // gap as getAllWasteBagController below. Deferred, not invented here.
}
export interface MobileWasteBagDetailResponse {
  status: "success";
  data: Record<string, unknown> | null;
}

// GET /api/v1/mobile
export interface MobileGetAllWasteBagRequest {
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
}
export interface MobileGetAllWasteBagResponse {
  status: "success";
  data: unknown;
}

// POST /api/v1/mobile/receiving-treatment-external
export interface MobileReceivingTreatmentExternalRequest {
  wasteBagQrCodeIds: string[];
  startTime: string;
  endTime: string;
}
export interface MobileReceivingTreatmentExternalResponse {
  status: "success";
  data: { wasteBagQrCodeIds: string[]; groupId?: number };
}

// POST /api/v1/mobile/follow-up-action
// Encore's static analyzer can't resolve `(typeof arr)[number]` indexed
// access on a tuple const (used for runtime validation elsewhere) when the
// result is used as an API field type, so the union is spelled out
// explicitly here and the array below is retyped as a plain readonly
// string[] rather than `as const`.
export type MobileWasteFollowUpActionType =
  | "TEMPORARY_STORAGE"
  | "COLD_STORAGE"
  | "DISINFECTION"
  | "PYROLYSIS"
  | "INTERNAL_LANDFILLER"
  | "TRANSPORTER_LANDFILL"
  | "TRANSPORTER_RECYCLER"
  | "TRANSPORTER_TREATMENT"
  | "SPECIALIZED_TREATMENT_PROVIDER"
  | "TRANSPORTER_GOVERNMENT"
  | "TRANSPORTER_GOVERNMENT_WASTE_BANK";
export const MOBILE_WASTE_FOLLOW_UP_ACTION_TYPES = [
  "TEMPORARY_STORAGE",
  "COLD_STORAGE",
  "DISINFECTION",
  "PYROLYSIS",
  "INTERNAL_LANDFILLER",
  "TRANSPORTER_LANDFILL",
  "TRANSPORTER_RECYCLER",
  "TRANSPORTER_TREATMENT",
  "SPECIALIZED_TREATMENT_PROVIDER",
  "TRANSPORTER_GOVERNMENT",
  "TRANSPORTER_GOVERNMENT_WASTE_BANK",
] as const satisfies readonly MobileWasteFollowUpActionType[];

export interface MobileWasteFollowUpRequest {
  wasteBagQrCodeIds: string[];
  actionType: MobileWasteFollowUpActionType;
  startTime?: string;
  endTime?: string;
  transporterVehicleId?: number;
  transporterId?: number;
  thirdPartyId?: number;
}
export interface MobileWasteFollowUpResponse {
  status: "success";
  data: unknown;
}

// POST /api/v1/mobile/post-treatment
export type MobileWastePostTreatmentActionType =
  | "DISINFECTION"
  | "PYROLYSIS"
  | "LANDFILLED"
  | "RECYCLED"
  | "DISPOSED";
export const MOBILE_WASTE_POST_TREATMENT_ACTION_TYPES = [
  "DISINFECTION",
  "PYROLYSIS",
  "LANDFILLED",
  "RECYCLED",
  "DISPOSED",
] as const satisfies readonly MobileWastePostTreatmentActionType[];

export interface MobileWastePostTreatmentRequest {
  wasteBagQrCodeIds: string[];
  actionType: MobileWastePostTreatmentActionType;
  healthcareFacilityId: number;
  startTime?: string;
  endTime?: string;
  transporterVehicleId?: number;
}
export interface MobileWastePostTreatmentResponse {
  status: "success";
  data: { affected: number };
}

// GET /api/v1/mobile/report
export interface MobileWasteBagReportRequest {
  limit?: number;
  page?: number;
  startDate: string;
  endDate: string;
  healthcareFacilityId?: number;
}
export interface MobileWasteBagReportResponse {
  status: "success";
  data: {
    resultSummaryCharacteristic: unknown;
    resultSummaryWasteSource: unknown;
    resultSummaryWasteStatus: unknown;
  };
}

// GET /api/v1/mobile/report-waste-status
export interface MobileWasteBagReportByStatusRequest {
  limit?: number;
  page?: number;
  startDate: string;
  endDate: string;
  healthcareFacilityId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteStatus?: string;
}
export interface MobileWasteBagReportByStatusResponse {
  status: "success";
  data: {
    data: Record<string, unknown>[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  };
}
