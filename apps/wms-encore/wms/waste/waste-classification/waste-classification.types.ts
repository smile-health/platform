// Mirrors apps/wms-service's domain/entities/WasteClassification.ts field-for-field.
//
// Enum-like fields (wasteBagColorCode, storageRuleType, allowedVehicleTypes)
// are kept as plain `string` here — Encore decodes request bodies against
// these interfaces directly, so a union type on a wire field is disallowed.
// The exact allowed values are validated manually via Zod in
// waste-classification.schema.ts / enforced in waste-classification.service.ts:
//   wasteBagColorCode: BLACK | GRAY | YELLOW | PURPLE | BROWN | RED | NONE
//   storageRuleType:   STATIC | RULE_BASED
//   allowedVehicleTypes: BOX_TRUCK | REFRIGERATED_BOX_TRUCK | OPEN_BODY_TRUCK |
//     TANKER | HAZARDOUS_MATERIAL_TRUCK | RADIOACTIVE_MATERIAL_TRUCK |
//     FLATBED_TRUCK | LOADER_TRUCK | TRAILER | VAN

// Summary of a joined waste_hierarchy row (waste_type / waste_group /
// waste_characteristics). Mirrors the attribute subsets the original
// repository selects for each of the three joins.
export interface WasteHierarchySummary {
  id: number;
  name: string;
  nameEn: string;
  regionId?: number;
  description?: string;
  descriptionEn?: string;
  parentHierarchyId?: number | null;
  // Only populated on the wasteCharacteristics join (mirrors the original
  // selecting `isResidue` only for that relation).
  isResidue?: boolean;
}

export interface WasteClassification {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  regionId: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType?: string;
  useColdStorage: boolean;
  coldStorageMinHours?: number;
  coldStorageMaxHours?: number;
  tempStorageMinHours?: number;
  tempStorageMaxHours?: number;
  minimunDecayDay?: number;
  storageRule?: string;
  allowHealthcareFacilityTreatment: boolean;
  isActive: boolean;
  hasMultipleTransporters: boolean;
  treatmentMethod?: string | null;
  disposalMethod?: string;
  allowedVehicleTypes?: string | null;
  wasteType?: WasteHierarchySummary;
  wasteGroup?: WasteHierarchySummary;
  wasteCharacteristics?: WasteHierarchySummary;
  // Original enriches this via a cross-service HTTP call
  // (getUsersDetail(updatedBy, token) against apps/core) —
  // waste-classification.service.ts's getAllWasteClassifications populates
  // this from the local `users` table instead, same convention as
  // asset/qr-code-config's userName field.
  userName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteClassification {
  data: WasteClassification[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-classification
export interface GetAllWasteClassificationRequest {
  limit?: number;
  page?: number;
  search?: string;
  wasteCode?: string;
  useColdStorage?: string;
  updatedAt?: string;
  sortBy?: string;
  sortOrder?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
}
export interface GetAllWasteClassificationResponse {
  status: "success";
  data: PaginatedWasteClassification;
}

// GET /api/v1/waste-classification/:id
export interface GetWasteClassificationByIdRequest {
  id: string;
}
export interface GetWasteClassificationByIdResponse {
  status: "success";
  data: WasteClassification;
}

// POST /api/v1/waste-classification
export interface CreateWasteClassificationRequest {
  regionId?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType?: string;
  useColdStorage: boolean;
  coldStorageMinHours?: number;
  coldStorageMaxHours?: number;
  tempStorageMinHours?: number;
  tempStorageMaxHours?: number;
  minimunDecayDay?: number;
  storageRule?: string;
  allowHealthcareFacilityTreatment: boolean;
  isActive?: boolean;
  hasMultipleTransporters: boolean;
  treatmentMethod?: string;
  disposalMethod: string;
  allowedVehicleTypes?: string;
}
export interface CreateWasteClassificationResponse {
  status: "success";
  data: WasteClassification;
}

// PUT /api/v1/waste-classification/:id
export interface UpdateWasteClassificationRequest {
  id: string;
  regionId?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  wasteTypeId: number;
  wasteGroupId: number;
  wasteCharacteristicsId: number;
  wasteCode: string;
  wasteBagColorCode: string;
  storageRuleType?: string;
  useColdStorage: boolean;
  coldStorageMinHours?: number;
  coldStorageMaxHours?: number;
  tempStorageMinHours?: number;
  tempStorageMaxHours?: number;
  minimunDecayDay?: number;
  storageRule?: string;
  hasMultipleTransporters: boolean;
  allowHealthcareFacilityTreatment: boolean;
  treatmentMethod?: string;
  disposalMethod: string;
  allowedVehicleTypes?: string;
}
export interface UpdateWasteClassificationResponse {
  status: "success";
  data: WasteClassification;
}

// DELETE /api/v1/waste-classification/:id
export interface DeleteWasteClassificationRequest {
  id: string;
}
export interface DeleteWasteClassificationResponse {
  status: "success";
  data: boolean;
}
