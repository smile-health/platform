// Mirrors apps/wms-service's domain/entities/HealthcareFacilityAsset.ts
// field-for-field. `assetStatus` is a plain string here (Encore api() request
// types must not be unions/z.infer) — validated against the fixed enum set
// manually via Zod in healthcare-facility-asset.schema.ts.

export interface AssetManufacturer {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AssetModel {
  id: number;
  name: string;
  description?: string;
  assetType?: string;
  manufacturerId: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  manufacturer?: AssetManufacturer;
}

export interface HealthcareFacilityAsset {
  id?: number;
  createdBy: string;
  updatedBy?: string;
  // 'OPERATIONAL' | 'UNDER_MAINTAINENCE' | 'OUT_OF_SERVICE' | 'IDLE' | 'RETIRED'
  assetStatus: string;
  healthcareFacilityId: number;
  assetId: string;
  modelId: number;
  isIotEnable: boolean;
  createdAt: Date;
  updatedAt?: Date;
  assetModel?: AssetModel;
  healthcareFacilityName?: string;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  yearOfProduction?: number;
  dateCalibrationActivity?: Date;
  dateMaintenanceActivity?: Date;
  entityName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedHealthcareFacilityAssets {
  data: HealthcareFacilityAsset[];
  pagination: PaginationMeta;
}

// GET /api/v1/healthcare-facility-asset/:id
export interface GetHealthcareFacilityAssetByIdRequest {
  id: string;
}
export interface GetHealthcareFacilityAssetByIdResponse {
  status: "success";
  data: HealthcareFacilityAsset;
}

// GET /api/v1/healthcare-facility-asset
export interface GetAllHealthcareFacilityAssetsRequest {
  limit?: number;
  page?: number;
  search?: string;
  healthcareFacilityId?: number;
  assetType?: string;
  manufacturerId?: number;
  isIotEnable?: number;
  assetStatus?: string;
}
export interface GetAllHealthcareFacilityAssetsResponse {
  status: "success";
  data: PaginatedHealthcareFacilityAssets;
}

// GET /api/v1/healthcare-facility-asset/entity
export interface GetAllHealthcareFacilityAssetsByEntityIdRequest {
  limit?: number;
  page?: number;
  search?: string;
  assetType?: string;
  manufacturerId?: number;
}
export interface GetAllHealthcareFacilityAssetsByEntityIdResponse {
  status: "success";
  data: PaginatedHealthcareFacilityAssets;
}

// POST /api/v1/healthcare-facility-asset
export interface CreateHealthcareFacilityAssetRequest {
  assetStatus: string;
  assetId: string;
  modelId: number;
  healthcareFacilityId?: number;
  isIotEnable: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  yearOfProduction?: number;
}
export interface CreateHealthcareFacilityAssetResponse {
  status: "success";
  data: HealthcareFacilityAsset;
}

// PUT /api/v1/healthcare-facility-asset/:id
export interface UpdateHealthcareFacilityAssetRequest {
  id: string;
  assetStatus?: string;
  assetId?: string;
  modelId: number;
  healthcareFacilityId?: number;
  isIotEnable?: boolean;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  yearOfProduction?: number;
}
export interface UpdateHealthcareFacilityAssetResponse {
  status: "success";
  data: HealthcareFacilityAsset;
}

// PATCH /api/v1/healthcare-facility-asset/:id?is_iot_enable=<string>
export interface PatchHealthcareFacilityAssetRequest {
  id: string;
  is_iot_enable?: string;
}
export interface PatchHealthcareFacilityAssetResponse {
  status: "success";
  data: HealthcareFacilityAsset;
}

// DELETE /api/v1/healthcare-facility-asset/:id
export interface DeleteHealthcareFacilityAssetRequest {
  id: string;
}
export interface DeleteHealthcareFacilityAssetResponse {
  status: "success";
  data: boolean;
}
