// Mirrors apps/wms-service's domain/entities/WasteTransportationExternalGroup.ts
// field-for-field for the fields this port actually populates. This is the
// "external" counterpart of waste-transportation-group (own-network transport
// via the platform's partnership network) — this module covers transport
// handed off to a third party outside that network. See
// ../waste-transportation-group/ (built in parallel) for the sibling module.
//
// Enrichment fields the original attaches via extra round-trips — waste
// classification summary (wasteType/wasteGroup/wasteCharacteristics),
// per-bag wasteClassification, partnership lookup, PartnerVehicleModel data,
// and provider/consumer entity names — are all wired in
// waste-transport-external-group.repository.ts, from local tables
// (entities/waste_classification/waste_hierarchy/partnership) rather than
// the original's HTTP round-trips. This module has no manifestDocPath field,
// so there's no presigned-URL piece to wire here (unlike the sibling
// waste-treatment-external-group/waste-bag-treatment-group modules).
// Remaining `Record<string, unknown>` typing below is just this port's
// general convention for cross-module summary objects, not a placeholder
// for missing data.

export type TransportationStatus = "READY_FOR_TRANSPORT" | "TRANSPORTATION_REQUEST_CREATED" | "IN_TRANSIT";

export interface WasteTransportExternalGroupBag {
  id: number;
  wasteBagQrCodeId?: string;
  wasteStatus: string;
  weightInKgs?: number;
  createdAt: Date;
  healthcareFacilityId?: number;
  healthcareFacilityName?: string;
  transporterId?: number;
  transporterName?: string;
  thirdPartyId?: number;
  wasteClassificationId?: number;
  // Populated via buildBagWasteClassification(classification) — see
  // waste-transport-external-group.repository.ts's toEntity.
  wasteClassification?: Record<string, unknown>;
}

export interface WasteTransportExternalGroup {
  id: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalBagsCount: number;
  totalWeightInKgs: number;
  transporterId: number;
  transporterVehicleId?: number;
  transporterVehicleNumber?: string;
  transporterOperatorId?: string;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus: TransportationStatus;
  handoverTimestamp?: Date;
  isReadOnly?: boolean;
  groupId?: string;
  wasteTreatmentExternalGroupId?: number;
  pickupAt?: Date;
  providerName?: string;
  consumerName?: string;
  wasteBags: WasteTransportExternalGroupBag[];
  // wasteType/wasteGroup/wasteCharacteristics come from
  // buildGroupWasteClassificationSummary() over the group's bag
  // classifications; partnership from partnership.service.ts's
  // getProviderNameAndListOperatorNameByHfIdAndWasteClassificationId;
  // vehicle from partner-vehicle.repository.ts; processWastebagEnd from
  // handleAnalisisProcessCount() — all wired in
  // waste-transport-external-group.repository.ts's toEntity.
  wasteType?: Record<string, unknown>;
  wasteGroup?: Record<string, unknown>;
  wasteCharacteristics?: unknown[];
  partnership?: Record<string, unknown>;
  vehicle?: unknown[];
  processWastebagEnd?: string[];
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteTransportExternalGroup {
  data: WasteTransportExternalGroup[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-transport-external-group
export interface GetAllWasteTransportExternalGroupRequest {
  limit?: number;
  page?: number;
  status?: string;
  anotherStatus?: string;
  externalTreatment?: string;
  treatmentMethod?: string;
  transportationStatus?: string;
  entityId?: number;
  healthcareFacilityId?: number;
  startDate?: string;
  endDate?: string;
}
export interface GetAllWasteTransportExternalGroupResponse {
  status: "success";
  data: PaginatedWasteTransportExternalGroup;
}

// GET /api/v1/waste-transport-external-group/detail
export interface GetWasteTransportExternalGroupRequest {
  id?: number;
  qrCodeId?: string;
}
export interface GetWasteTransportExternalGroupResponse {
  status: "success";
  data: WasteTransportExternalGroup;
}
