// Mirrors apps/wms-service's domain/entities/AssetModel.ts field-for-field.
// assetType is a plain string here (never a TS union) because api() request/
// response fields Encore decodes off the wire must not be typed as a union —
// the allowed values (SCALE | INCINERATOR | AUTOCLAVE | COLD_STORAGE) are
// validated manually via Zod in asset-model.schema.ts / asset-model.service.ts.
export interface AssetModel {
  id?: number;
  createdBy: string;
  updatedBy: string;
  assetType: string;
  manufacturerId: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  manufacturer?: AssetManufacturerSummary;
}

// Joined asset_manufacturer columns (id, name, description) — mirrors the
// `assetManufacturer` include in AssetModelRepositoryImpl.
export interface AssetManufacturerSummary {
  id: number;
  name: string;
  description?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedAssetModels {
  data: AssetModel[];
  pagination: PaginationMeta;
}

// GET /api/v1/asset-model
export interface GetAllAssetModelsRequest {
  limit?: number;
  page?: number;
  search?: string;
  assetType?: string;
  manufacturerId?: number;
}
export interface GetAllAssetModelsResponse {
  status: "success";
  data: PaginatedAssetModels;
}

// GET /api/v1/asset-model/:id
export interface GetAssetModelByIdRequest {
  id: string;
}
export interface GetAssetModelByIdResponse {
  status: "success";
  data: AssetModel;
}

// POST /api/v1/asset-model
export interface CreateAssetModelRequest {
  assetType: string;
  manufacturerId: number;
  name: string;
  description?: string;
}
export interface CreateAssetModelResponse {
  status: "success";
  data: AssetModel;
}

// PUT /api/v1/asset-model/:id
// Mirrors updateAsset.schema.ts: unlike most other ported modules' "update"
// endpoints, the original requires assetType/manufacturerId/name on every
// update (only description is optional) — this is NOT a partial-update body.
export interface UpdateAssetModelRequest {
  id: string;
  assetType: string;
  manufacturerId: number;
  name: string;
  description?: string;
}
export interface UpdateAssetModelResponse {
  status: "success";
  data: AssetModel;
}

// DELETE /api/v1/asset-model/:id
export interface DeleteAssetModelRequest {
  id: string;
}
export interface DeleteAssetModelResponse {
  status: "success";
  data: boolean;
}
