// Mirrors apps/wms-service's domain/entities/WasteTreatmentExternalGroup.ts
// field-for-field. This is the "external" counterpart of
// waste-bag-treatment-group (built in parallel, see
// waste/waste-bag-treatment-group/) — for treatment handed over to a third
// party rather than handled within the platform's own partnership network.
//
// transportationStatus is kept as plain `string` here (not a union) per
// convention — Encore's wire decoder can't validate a union of string
// literals on a field it decodes directly. The exact allowed values are
// documented below and validated manually in
// waste-treatment-external-group.service.ts.
export const TRANSPORTATION_STATUS_VALUES = [
  "STORED_FOR_TREATMENT",
  "READY_FOR_TREATMENT",
  "INCINERATION_IN_PROCESS",
  "STERILIZATION_IN_PROCESS",
  "INCINERATED",
  "STERILISED",
  "LANDFILLED",
  "RECYCLED",
  "DISPOSED",
  "COLLECTED",
] as const;
export type TransportationStatus =
  | "STORED_FOR_TREATMENT"
  | "READY_FOR_TREATMENT"
  | "INCINERATION_IN_PROCESS"
  | "STERILIZATION_IN_PROCESS"
  | "INCINERATED"
  | "STERILISED"
  | "LANDFILLED"
  | "RECYCLED"
  | "DISPOSED"
  | "COLLECTED";

// Original controller's allow-list for the `status` query param on
// getAllWasteTreatmentExternalGroup (matches waste_bag.waste_status values).
export const ALLOWED_STATUS_VALUES = [
  "IN_TEMPORARY_STORAGE",
  "IN_COLD_STORAGE",
  "INCINERATION_IN_PROCESS",
  "STERILIZATION_IN_PROCESS",
  "INCINERATED",
  "STERILISED",
  "READY_FOR_TRANSPORT",
  "TRANSPORTATION_REQUEST_CREATED",
  "IN_TRANSIT",
  "READY_FOR_TREATMENT",
  "RECYCLED",
  "LANDFILLED",
  "COLLECTED",
  "DISPOSED",
] as const;

// Original controller's allow-list for the derived `roles` value (from
// req.user?.external_roles) — note operator_waste_bank is part of the
// *domain*'s roles union but is NOT in this allow-list, so it can never be
// selected via this gate. Preserved verbatim (see service.ts for the bug this
// produces).
export const ALLOWED_OPERATOR_ROLES = [
  "operator_landfill",
  "operator_treatment",
  "operator_recycler",
] as const;

// Summary of a joined waste_hierarchy row (waste_type / waste_group /
// waste_characteristics), same shape as waste-classification's
// WasteHierarchySummary (see waste/waste-classification/waste-classification.types.ts).
export interface WasteHierarchySummary {
  id: number;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  isResidue?: boolean;
}

// Trimmed waste_bag row as returned in a group's `wasteBags` list. Mirrors
// the attribute subset the original repository selects/projects for this
// relation (differs slightly between the by-id and the list endpoints in the
// original — the by-id shape is richer; documented per-field below).
export interface WasteTreatmentExternalGroupBag {
  id?: number;
  wasteBagQrCodeId?: string;
  wasteStatus: string;
  weightInKgs?: number;
  createdAt?: Date;
  healthcareFacilityId?: number;
  healthcareFacilityName?: string;
  wasteStatusUpdatedAt?: Date;
  // Only populated by getWasteTreatmentExternalGroupByIdWithWasteBags (the
  // original resolves these per-bag there; the list endpoint doesn't).
  thirdPartyId?: number;
  manifestDocNumber?: string;
  manifestDocPath?: string | null;
  logHistory?: Record<string, unknown>[];
  treatmentMethod?: string;
  wasteClassification?: Record<string, unknown>;
  treatmentStartTime?: Date;
  treatmentEndTime?: Date;
  wasteSource?: {
    internalSourceName?: string;
    internalTreatmentName?: string;
    externalHealthcareFacilityName?: string;
    sourceType?: string;
  };
}

export interface WasteTreatmentExternalGroup {
  id?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalBagsCount: number;
  totalWeightInKgs: number;
  sourceExternalTransportationGroupId?: number;
  treatmentProviderId?: number;
  treatmentOperatorId?: string;
  transporterOperatorId?: string;
  transporterVehicleId?: number;
  transporterVehicleNumber?: string;
  transportationStatus: string; // TransportationStatus
  isReadOnly?: boolean;
  groupId?: string;
  wasteBags?: WasteTreatmentExternalGroupBag[];
  wasteType?: WasteHierarchySummary;
  wasteGroup?: WasteHierarchySummary;
  wasteCharacteristics?: WasteHierarchySummary[];
  // partnership / vehicle / locationTreatment come from cross-service
  // lookups (partnership repository, PartnerVehicleModel, EntityLocationModel
  // — none ported yet). Kept as Record<string, unknown> (never bare
  // `object`, per convention) rather than typed, pending those ports.
  partnership?: Record<string, unknown> | null;
  vehicle?: Record<string, unknown>[];
  locationTreatment?: Record<string, unknown> | null;
  consumerName?: string;
  providerName?: string;
  processWastebagEnd?: string[];
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteTreatmentExternalGroup {
  data: WasteTreatmentExternalGroup[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-treatment-external-group
export interface GetAllWasteTreatmentExternalGroupRequest {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  entityId?: number;
  healthcareFacilityId?: number;
  status?: string;
  transportationStatus?: string;
}
export interface GetAllWasteTreatmentExternalGroupResponse {
  status: "success";
  data: PaginatedWasteTreatmentExternalGroup;
}

// GET /api/v1/waste-treatment-external-group/detail
export interface GetWasteTreatmentExternalGroupRequest {
  id?: number;
  qrCodeId?: string;
}
export interface GetWasteTreatmentExternalGroupResponse {
  status: "success";
  data: WasteTreatmentExternalGroup;
}
