// Mirrors apps/wms-service's domain/entities/QrCodeConfig.ts field-for-field.
// The original's `wasteSource` / `wasteClassification` joined objects (built
// from WasteSourceModel / WasteClassificationModel + nested WasteHierarchyModel
// rows in QrCodeConfigRepoitoryImpl.ts) come from tables not ported yet — they
// are kept here as opaque Record<string, unknown> bags (never bare `object`,
// per convention) rather than fully re-typed, since re-deriving their shape
// would just be guessing at those other modules' future types.
export interface QrCodeConfig {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
  wasteSource?: Record<string, unknown>;
  wasteClassification?: Record<string, unknown>;
  // Original: enriched via getUsersDetail(updatedBy, token)
  // (infrastructure/external-apis/thirdPartyClient.ts), only in the list
  // endpoint — see QrCodeConfigRepoitoryImpl.ts:454
  // (`fullName = [dataUser?.firstname, dataUser?.lastname].filter(Boolean).join(' ')`).
  // qr-code-config.service.ts now populates this from the local `users`
  // table via getLocalUserName (shared/core/entity-user-lookup.ts), which
  // resolves updated_by's user_uuid through users.repository.ts's
  // findByUserUuid. The remote apps/core HTTP fallback (for a user who has
  // never authenticated against this app) still isn't ported.
  userName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedQrCodeConfig {
  data: QrCodeConfig[];
  pagination: PaginationMeta;
}

// GET /api/v1/qr-code-config
export interface GetAllQrCodeConfigRequest {
  limit?: number;
  page?: number;
  search?: string;
  sourceType?: string;
  sortBy?: string;
  sortOrder?: string;
  // Original: `entity_id` query param, falling back to req.user?.entity.id
  // (the caller's healthcareFacilityId) when absent. Kept as a plain string
  // query param, same as the original's req.query.entity_id.
  entity_id?: string;
}
export interface GetAllQrCodeConfigResponse {
  status: "success";
  data: PaginatedQrCodeConfig;
}

// GET /api/v1/qr-code-config/:id
export interface GetQrCodeConfigByIdRequest {
  id: string;
}
export interface GetQrCodeConfigByIdResponse {
  status: "success";
  data: QrCodeConfig;
}

// POST /api/v1/qr-code-config
export interface CreateQrCodeConfigRequest {
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
}
export interface CreateQrCodeConfigResponse {
  status: "success";
  data: QrCodeConfig;
}

// PUT /api/v1/qr-code-config/:id
export interface UpdateQrCodeConfigRequest {
  id: string;
  wasteSourceId: number;
  wasteClassificationId: number;
  labelCount: number;
}
export interface UpdateQrCodeConfigResponse {
  status: "success";
  data: QrCodeConfig;
}

// DELETE /api/v1/qr-code-config/:id
export interface DeleteQrCodeConfigRequest {
  id: string;
}
export interface DeleteQrCodeConfigResponse {
  status: "success";
  data: boolean;
}
