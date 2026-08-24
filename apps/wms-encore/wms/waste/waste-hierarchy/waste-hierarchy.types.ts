// Mirrors apps/wms-service's domain/entities/WasteHierarchy.ts field-for-field.
// `level` encodes the hierarchy tier: 0 = waste type, 1 = waste group,
// 2 = waste characteristics (the leaf level waste-classification hangs off).
export interface WasteHierarchySummary {
  id: number;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  parentHierarchyId?: number;
  regionId: number;
}

// Mirrors the original's `wasteClassification` association — only the two
// fields WasteHierarchyRepositoryImpl.getWasteHierarchyByParentHierarchyId
// actually reads off the joined WasteClassificationModel row.
export interface WasteClassificationSummary {
  id: number;
  wasteCode: string;
}

export interface WasteHierarchy {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  parentHierarchyId?: number | null;
  regionId: number;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  level?: number;
  isResidue?: boolean;
  isActive?: boolean;
  wasteType?: WasteHierarchySummary;
  wasteGroup?: WasteHierarchySummary;
  wasteClassification?: WasteClassificationSummary;
  // Populated from the local `users` table (getLocalUserName) rather than
  // the original's getUsersDetail(token) HTTP round-trip — see
  // waste-hierarchy.service.ts's getAllWasteHierarchy.
  userName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteHierarchy {
  data: WasteHierarchy[];
  pagination: PaginationMeta;
}

// Row shape returned by explanationOfWasteClassification's 3-way self-join
// (waste type -> waste group -> waste characteristics), one row per active
// (is_active = true) level-2 waste-hierarchy leaf.
export interface WasteClassificationExplanation {
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteTypeDescription: string | null;
  wasteTypeDescriptionEn: string | null;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteGroupDescription: string | null;
  wasteGroupDescriptionEn: string | null;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  wasteCharacteristicsDescription: string | null;
  wasteCharacteristicsDescriptionEn: string | null;
}

// GET /api/v1/waste-hierarchy/:id
export interface GetWasteHierarchyByIdRequest {
  id: string;
}
export interface GetWasteHierarchyByIdResponse {
  status: "success";
  data: WasteHierarchy;
}

// GET /api/v1/waste-hierarchy/parent-hierarchy?parent_hierarchy_id=...
export interface GetWasteHierarchyByParentHierarchyIdRequest {
  parent_hierarchy_id?: string;
}
export interface GetWasteHierarchyByParentHierarchyIdResponse {
  status: "success";
  data: WasteHierarchy[];
}

// GET /api/v1/waste-hierarchy
export interface GetAllWasteHierarchyRequest {
  limit?: number;
  page?: number;
  search?: string;
  level?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  isActive?: number;
}
export interface GetAllWasteHierarchyResponse {
  status: "success";
  data: PaginatedWasteHierarchy;
}

// POST /api/v1/waste-hierarchy
export interface CreateWasteHierarchyRequest {
  regionId?: number;
  parentHierarchyId?: number | null;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn?: string;
  level?: number;
  isResidue?: boolean;
  isActive?: boolean;
}
export interface CreateWasteHierarchyResponse {
  status: "success";
  data: WasteHierarchy;
}

// PUT /api/v1/waste-hierarchy/:id
export interface UpdateWasteHierarchyRequest {
  id: string;
  parentHierarchyId?: number | null;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  isResidue?: boolean;
  isActive?: boolean;
}
export interface UpdateWasteHierarchyResponse {
  status: "success";
  data: WasteHierarchy;
}

// DELETE /api/v1/waste-hierarchy/:id
export interface DeleteWasteHierarchyRequest {
  id: string;
}
export interface DeleteWasteHierarchyResponse {
  status: "success";
  data: boolean;
}

// GET /api/v1/waste-hierarchy/explanation-waste-classification
export interface ExplanationOfWasteClassificationRequest {}
export interface ExplanationOfWasteClassificationResponse {
  status: "success";
  data: WasteClassificationExplanation[];
}
