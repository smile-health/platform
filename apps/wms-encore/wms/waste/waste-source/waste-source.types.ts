// Mirrors apps/wms-service's domain/entities/WasteSource.ts field-for-field.
//
// sourceType/internalTreatmentName are enum-like in the original
// ('INTERNAL' | 'EXTERNAL' | 'INTERNAL_TREATMENT' and 'PYROLYSIS' |
// 'DISINFECTION' respectively) but are typed as plain `string` here per
// convention — validated manually via Zod in waste-source.service.ts.
export interface WasteSource {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  healthcareFacilityId: number;
  sourceType: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive: boolean;
  isResidue: boolean;
  // Original enriches list rows with getUsersDetail(updatedBy, token) (a
  // cross-service HTTP call to apps/core) to populate userName —
  // waste-source.service.ts populates this from the local `users` table
  // instead (see shared/core/entity-user-lookup.ts).
  userName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteSource {
  data: WasteSource[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-source/:id
export interface GetWasteSourceByIdRequest {
  id: string;
}
export interface GetWasteSourceByIdResponse {
  status: "success";
  data: WasteSource;
}

// GET /api/v1/waste-source
export interface GetAllWasteSourcesRequest {
  limit?: number;
  page?: number;
  search?: string;
  sourceType?: string;
}
export interface GetAllWasteSourcesResponse {
  status: "success";
  data: PaginatedWasteSource;
}

// POST /api/v1/waste-source
export interface CreateWasteSourceRequest {
  healthcareFacilityId?: number;
  sourceType: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive?: boolean;
  isResidue?: boolean;
}
export interface CreateWasteSourceResponse {
  status: "success";
  data: WasteSource;
}

// PUT /api/v1/waste-source/:id
export interface UpdateWasteSourceRequest {
  id: string;
  healthcareFacilityId?: number;
  sourceType?: string;
  internalSourceName?: string;
  internalTreatmentName?: string;
  externalHealthcareFacilityId?: number;
  externalHealthcareFacilityName?: string;
  isActive?: boolean;
}
export interface UpdateWasteSourceResponse {
  status: "success";
  data: WasteSource;
}

// PATCH /api/v1/waste-source/:id?is_active=
export interface PatchWasteSourceRequest {
  id: string;
  is_active?: string;
}
export interface PatchWasteSourceResponse {
  status: "success";
  data: WasteSource;
}

// DELETE /api/v1/waste-source/:id
export interface DeleteWasteSourceRequest {
  id: string;
}
export interface DeleteWasteSourceResponse {
  status: "success";
  data: boolean;
}
