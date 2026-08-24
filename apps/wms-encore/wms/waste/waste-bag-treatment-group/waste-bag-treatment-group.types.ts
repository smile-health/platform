// Mirrors apps/wms-service's domain/entities/WasteBagTreatmentGroup.ts
// (WasteTreatmentGroup class + WasteTreatmentGroupSelectDto) field-for-field.

// treatmentStatus as stored on waste_treatment_group.treatment_status itself
// (8 values — narrower than the 16-value AllowedStatus union the *listing*
// endpoint filters waste_bag.waste_status by, see below).
export const TREATMENT_GROUP_STATUS_VALUES = [
  "IN_TEMPORARY_STORAGE",
  "IN_COLD_STORAGE",
  "INTERNAL_LANDFILL_IN_PROCESS",
  "INTERNAL_LANDFILLED",
  "INCINERATION_IN_PROCESS",
  "STERILIZATION_IN_PROCESS",
  "INCINERATED",
  "STERILISED",
] as const;
export type TreatmentGroupStatus =
  | "IN_TEMPORARY_STORAGE"
  | "IN_COLD_STORAGE"
  | "INTERNAL_LANDFILL_IN_PROCESS"
  | "INTERNAL_LANDFILLED"
  | "INCINERATION_IN_PROCESS"
  | "STERILIZATION_IN_PROCESS"
  | "INCINERATED"
  | "STERILISED";

// The `status` query param accepted by getAllWasteBagTreatmentGroup filters
// waste_bag.waste_status, a *different*, wider enum (18 values on the
// waste_bag entity side per waste-bag.types.ts's WASTE_STATUS_VALUES) — the
// controller's local `AllowedStatus` union below is yet another, third list
// (16 values) that disagrees with both. Preserved verbatim: only these 16
// values are accepted; anything else is silently dropped (no error), same as
// the original's `if (typeof statusParam === 'string' && allAllowedStatuses.includes(...))`.
export const ALLOWED_LISTING_STATUS_VALUES = [
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
  "READY_FOR_TREATMENT",
  "RECYCLED",
  "LANDFILLED",
  "COLLECTED",
  "DISPOSED",
] as const;
export type AllowedListingStatus =
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
  | "READY_FOR_TREATMENT"
  | "RECYCLED"
  | "LANDFILLED"
  | "COLLECTED"
  | "DISPOSED";

export interface WasteTreatmentGroup {
  id?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalBagsCount: number;
  totalWeightInKgs: number;
  treatmentAssetId?: number;
  treatmentOperatorId?: number;
  handoverLattitude?: number;
  handoverLongitude?: number;
  treatmentStatus: TreatmentGroupStatus;
  handoverTimestamp?: Date;
  isReadOnly?: boolean;
  groupId?: string;
  // Original types these `any` — the associated waste_bag rows, each
  // enriched (in getWasteBagTreatmentGroupByIdWithWasteBags /
  // getAllWasteTreatMentGroup) with a computed `wasteClassification`
  // summary, `treatmentMethod`, `logHistory`, and a presigned
  // `manifestDocPath`. All wired up in waste-bag-treatment-group.service.ts
  // — each element is left as Record<string, unknown> rather than a bare
  // `object` per convention, not because the enrichment is missing.
  wasteBags?: Record<string, unknown>[];
  wasteType?: Record<string, unknown>;
  wasteGroup?: Record<string, unknown>;
  wasteCharacteristics?: Record<string, unknown>[];
  partnership?: Record<string, unknown>;
  vehicle?: Record<string, unknown>;
  processWastebagEnd?: string[];
}

export interface WasteTreatmentGroupSelectDto {
  id: number;
  groupId: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteTreatmentGroup {
  data: WasteTreatmentGroup[];
  pagination: PaginationMeta;
}

export interface PaginatedWasteTreatmentGroupSelectDto {
  data: WasteTreatmentGroupSelectDto[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-bag-treatment-group
export interface GetAllWasteBagTreatmentGroupRequest {
  limit?: number;
  page?: number;
  entityId?: number;
  startDate?: string;
  endDate?: string;
  // Plain string per convention #2 — validated/narrowed against
  // ALLOWED_LISTING_STATUS_VALUES manually in service.ts, mirroring the
  // controller's inline AllowedStatus check.
  status?: string;
}
export interface GetAllWasteBagTreatmentGroupResponse {
  status: "success";
  data: PaginatedWasteTreatmentGroup;
}

// GET /api/v1/waste-bag-treatment-group/detail
export interface GetWasteBagTreatmentGroupRequest {
  id?: string;
  qrCodeId?: string;
}
export interface GetWasteBagTreatmentGroupResponse {
  status: "success";
  data: WasteTreatmentGroup;
}

// GET /api/v1/waste-bag-treatment-group/pending
export interface GetPendingWasteTreatmentGroupsRequest {
  limit?: number;
  page?: number;
  entityId?: number;
}
export interface GetPendingWasteTreatmentGroupsResponse {
  status: "success";
  data: PaginatedWasteTreatmentGroupSelectDto;
}
