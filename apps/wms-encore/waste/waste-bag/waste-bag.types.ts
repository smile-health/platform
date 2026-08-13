// Mirrors apps/wms-service's domain/entities/WasteBag.ts field-for-field
// (WasteBagModel.ts's DB-facing attributes are documented in
// waste-bag.repository.ts's column comment instead of here).
//
// wasteStatus / transportationStatus / ownedBy / scaleMethod / iotMethod are
// typed as plain `string` here (not a union) per convention — Encore's wire
// decoder can't validate a union of string literals cleanly, so validity is
// checked manually in waste-bag.service.ts via the *_VALUES arrays below.

export const WASTE_STATUS_VALUES = [
  "INTERNAL_LANDFILL_IN_PROCESS",
  "INTERNAL_LANDFILLED",
  "IN_TEMPORARY_STORAGE",
  "IN_COLD_STORAGE",
  "INCINERATION_IN_PROCESS",
  "STERILIZATION_IN_PROCESS",
  "INCINERATED",
  "STERILISED",
  "READY_FOR_TRANSPORT",
  "TRANSPORTATION_REQUEST_CREATED",
  "IN_TRANSIT",
  "HANDOVER_TO_TREATMENT",
  "READY_FOR_TREATMENT",
  "IN_THIRD_PARTY_STORAGE",
  "RECYCLED",
  "LANDFILLED",
  "COLLECTED",
  "DISPOSED",
] as const;
export type WasteStatus =
  | "INTERNAL_LANDFILL_IN_PROCESS"
  | "INTERNAL_LANDFILLED"
  | "IN_TEMPORARY_STORAGE"
  | "IN_COLD_STORAGE"
  | "INCINERATION_IN_PROCESS"
  | "STERILIZATION_IN_PROCESS"
  | "INCINERATED"
  | "STERILISED"
  | "READY_FOR_TRANSPORT"
  | "TRANSPORTATION_REQUEST_CREATED"
  | "IN_TRANSIT"
  | "HANDOVER_TO_TREATMENT"
  | "READY_FOR_TREATMENT"
  | "IN_THIRD_PARTY_STORAGE"
  | "RECYCLED"
  | "LANDFILLED"
  | "COLLECTED"
  | "DISPOSED";

export const TRANSPORTATION_STATUS_VALUES = ["REQUESTED", "IN_TRANSIT", "HANDED_OVER"] as const;
export type TransportationStatus = "REQUESTED" | "IN_TRANSIT" | "HANDED_OVER";

export const OWNED_BY_VALUES = ["HEALTHCARE_FACILITY", "TRANSPORTER", "THIRD_PARTY"] as const;
export type OwnedBy = "HEALTHCARE_FACILITY" | "TRANSPORTER" | "THIRD_PARTY";

export const SCALE_METHOD_VALUES = ["MANUAL", "IOT"] as const;
export type ScaleMethod = "MANUAL" | "IOT";

export const IOT_METHOD_VALUES = ["BLUETOOTH", "INTERNET"] as const;
export type IotMethod = "BLUETOOTH" | "INTERNET";

export interface WasteBag {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  wasteBagQrCodeId?: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  sourceTreatmentGroupId?: string;
  scaleMethod: string; // ScaleMethod
  assetId?: number;
  weightInKgs?: number;
  storageStartTimestamp?: Date;
  scheduledStorageEndDatetime?: Date;
  actualStorageEndDatetime?: Date;
  maxStorageHours?: number;
  minimumStorageHours?: number;
  wasteTreatmentGroupId?: number;
  wasteTransportationGroupId?: number;
  wasteTreatmentExternalGroupId?: number;
  wasteTransportationExternalGroupId?: number;
  wasteStatus: string; // WasteStatus
  wasteStatusUpdatedAt?: Date;
  wasteStatusUpdatedBy?: string;
  transportationStatus?: string; // TransportationStatus
  transportationStatusUpdatedAt?: Date;
  transportationStatusUpdatedBy?: string;
  ownedBy: string; // OwnedBy
  transporterId?: number;
  thirdPartyId?: number;
  isTreated: boolean;
  isDisposed: boolean;
  binNumber?: string;
  iotMethod?: string; // IotMethod
  manifestDocNumber?: string;
  manifestDocPath?: string;
  treatmentStartTime?: Date;
  treatmentEndTime?: Date;
  wasteGroupIds?: string;
  treatmentLocationId?: number;
  healthcareFacilityName?: string;
  transporterName?: string;
  thirdPartyName?: string;
  bastNo?: string;
  materialIds?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteBags {
  data: WasteBag[];
  pagination: PaginationMeta;
}

// A "bulk action" result — every temporary-store/cold-store/treatment/etc.
// action in the original operates on an array of wasteBagQrCodeIds and
// returns either a count/group-id (number), null (nothing matched), or a
// string error code (`waste.error.<CODE>` in the original's i18n). The port
// throws APIError for the string-error and null cases instead — see
// waste-bag.service.ts's per-action comments for exactly which flag each one
// used originally.
export interface BulkActionResult {
  affected: number;
}

// ---- Requests / Responses -------------------------------------------------

// GET /api/v1/waste
export interface GetAllWasteBagsRequest {
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
  sourceType?: string;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
  loggerHistory?: string;
}
export interface GetAllWasteBagsResponse {
  status: "success";
  data: PaginatedWasteBags;
}

// POST /api/v1/waste
export interface CreateWasteBagRequest {
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  sourceTreatmentGroupId?: string;
  scaleMethod: string;
  weightInKgs?: number;
  wasteBagQrCodeId: string;
  assetId?: number;
  binNumber?: string;
  wasteGroupIds?: string;
  bastNo?: string;
  materialIds?: string;
  iotMethod?: string;
  isTreated?: boolean;
  isRadioActive?: boolean;
}
export interface CreateWasteBagResponse {
  status: "success";
  data: WasteBag;
}

// PATCH /api/v1/waste/temporary-store
// PATCH /api/v1/waste/cold-store  (adds endTime)
// POST  /api/v1/waste/follow-up-treatment (same shape as temporary-store)
export interface BulkWasteBagQrCodeRequest {
  wasteBagQrCodeIds: string[];
  endTime?: string;
}
export interface BulkActionResponse {
  status: "success";
  data: BulkActionResult;
}

// PATCH /api/v1/waste/internal_landfill
// PATCH /api/v1/waste/sterilise
// PATCH /api/v1/waste/incinerate
export interface TreatmentActionRequest {
  wasteBagQrCodeIds: string[];
  treatmentStartTime: string;
  treatmentEndTime: string;
}

// PATCH /api/v1/waste/follow-up/transport-request
// PATCH /api/v1/waste/follow-up/transport-external-request
export interface FollowUpTransportRequest {
  wasteBagQrCodeIds: string[];
  providerType: string;
  transporterVehicleId?: number;
  vehicleNumber?: string;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  isReadOnly?: boolean;
  transporterId?: number;
  thirdPartyId?: number;
  startTime?: string;
  endTime?: string;
}

// POST /api/v1/waste/handover/transport-request
// POST /api/v1/waste/handover/transport-external-request
//
// Deviation: the original accepts a multipart `manifest` file (compressed via
// compressManifestImage middleware) and stores its path. File upload plumbing
// is out of scope for this pass — the port accepts an already-uploaded
// manifestDocPath (string) instead of `file: Express.Multer.File`. Wiring the
// actual multipart endpoint + MinIO upload is a follow-up, same as every
// other file-accepting endpoint in this migration.
export interface HandoverTransportRequest {
  wasteTransportationGroupIds: number[];
  handoverLatitude: number;
  handoverLongitude: number;
  vehicleNumber: string;
  handoverTimestamp: string;
  manifestDocNumber: string;
  manifestDocPath: string;
  transporterOperatorId?: string;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  isReadOnly?: boolean;
}

// POST /api/v1/waste/pick-up/transport-external-request
export interface PickUpTransportExternalRequest {
  wasteTransportationExternalGroupIds: number[];
  healthcareFacilityId: number;
  handoverLatitude: number;
  handoverLongitude: number;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  isReadOnly?: boolean;
  // Mirrors TransportPickupDTO's startTime/endTime — needed so
  // WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL's scheduled follow-up can use a
  // real completion time (see waste-bag.service.ts's pickUpTransportExternalRequest).
  startTime?: string;
  endTime?: string;
}

// POST /api/v1/waste/handover/treatment-external-request
export interface HandoverTreatmentExternalRequest {
  wasteTransportationExternalGroupIds: number[];
  startTime: string;
  endTime: string;
  treatmentLocationId: number;
  treatmentId?: number;
  entityId?: number;
}

// POST /api/v1/waste/receiving/treatment-external-request
export interface ReceivingTreatmentExternalRequest {
  wasteBagQrCodeIds: string[];
  startTime: string;
  endTime: string;
  entityId?: number;
}

export interface GroupActionResponse {
  status: "success";
  data: { wasteBagQrCodeIds: string[]; groupId?: number; healthcareFacilityId?: number };
}

// GET /api/v1/waste/:id  (getWasteBagById — not a route in the original
// wasteRoutes.ts, but repo.getWasteBagById is part of WasteBagRepository and
// several other modules being ported in parallel (audit-trail, qr-code) need
// a single-record lookup; exposed here since this is the natural owner)
export interface GetWasteBagByIdRequest {
  id: string;
}
export interface GetWasteBagByIdResponse {
  status: "success";
  data: WasteBag;
}

// -- Reporting endpoints (reportWasteBagController.ts, same wasteRoutes.ts
// mount) -- the original's DTOs there are ad-hoc SQL projections, not full
// WasteBag entities.

// GET /api/v1/waste/transactions
// Mirrors ReportWasteBagRepositoryImpl.getAllTransactionWasteBagRaw's filter
// surface and ReportTransactionWasteBag row shape field-for-field (apps/web's
// TWasteTransaction/TWasteTransactionTotal types mirror the same shape on the
// frontend side).
export interface GetAllTransactionWasteBagsRequest {
  limit?: number;
  page?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  healthcareId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  transporterId?: number;
  treatmentStatus?: string;
  provinceId?: number;
  cityId?: number;
}

export interface TransactionWasteBag {
  id: number;
  createdAt: Date;
  wasteCode: string;
  qrCode: string;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  wasteStatus: string;
  weightInKgs: number | null;
  actualStorageEndDatetime: Date | null;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  transporterId: number | null;
  thirdPartyId: number | null;
  wasteSource: string | null;
  wasteTreatment: string | null;
  healthcareFacilityName: string | null;
  provinceName: string | null;
  regencyName: string | null;
  districtName: string | null;
  thirdPartyName: string | null;
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteStatusUpdatedAt: Date | null;
  wasteGroupNumber: string | null;
  checkInDate: Date;
  checkOutDate: Date | null;
  storageMax: number | null;
  weightOutKgs: number;
  wasteBagOut: number;
  manifestDocNumber: string | null;
  transporterName: string | null;
  disposalMethod: string | null;
  operatorHealthcareName: string | null;
}

export interface TransactionTotals {
  weightInKgs: string;
  wasteInBags: number;
  weightOutKgs: string;
  wasteOutBags: number;
}

export interface PaginatedTransactionWasteBags {
  data: TransactionWasteBag[];
  totals: TransactionTotals;
  pagination: PaginationMeta;
}

export interface GetAllTransactionWasteBagsResponse {
  status: "success";
  data: PaginatedTransactionWasteBags;
}

// GET /api/v1/waste/tracking-by-characteristics
export interface WasteBagSummaryByCharacteristicsRequest {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}
export interface WasteBagSummaryByCharacteristicsResponse {
  status: "success";
  data: Record<string, unknown>[];
}

// GET /api/v1/waste/tracking-by-waste-source
export interface WasteSourceSummaryRequest {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}
export interface WasteSourceSummaryResponse {
  status: "success";
  data: Record<string, unknown>[];
}

// GET /api/v1/waste/logbook
export interface WasteBagLogBookRequest {
  limit?: number;
  page?: number;
  healthcareId?: number;
}
export interface WasteBagLogBookResponse {
  status: "success";
  data: { data: Record<string, unknown>[]; pagination: PaginationMeta };
}

// GET /api/v1/waste/transaction-history
export interface WasteBagHistoryRequest {
  id?: number;
  limit?: number;
  page?: number;
}
export interface WasteBagHistoryResponse {
  status: "success";
  data: Record<string, unknown>[];
}

// GET /api/v1/waste/waste-group-details/:wasteGroupId
export interface WasteGroupDetailsRequest {
  wasteGroupId: string;
}
export interface WasteGroupDetailsResponse {
  status: "success";
  data: Record<string, unknown>;
}

// GET /api/v1/waste/waste-bag-internal-treatment-details/:wasteBagQrCodeId
export interface WasteBagInternalTreatmentDetailsRequest {
  wasteBagQrCodeId: string;
}
export interface WasteBagInternalTreatmentDetailsResponse {
  status: "success";
  data: Record<string, unknown>;
}
