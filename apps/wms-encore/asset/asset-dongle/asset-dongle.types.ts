// Mirrors apps/wms-service's domain/entities/AssetDongle.ts field-for-field.
//
// Note on assetId's type: AssetDongleModel.assetId is the table's PRIMARY KEY
// column (asset_id, INTEGER UNSIGNED, autoIncrement:true in the Sequelize
// model) — but CreateAssetDongleDTO/createAssetDongle.schema.ts require the
// caller to *supply* assetId as a non-empty string on create (it's really the
// id of an existing HealthcareAsset being tagged with a dongle, reusing that
// same numeric id as this table's PK — autoIncrement is effectively dead here
// since every create() call passes an explicit id). Preserved verbatim: the
// wire type stays string end-to-end (request body, entity field, path param),
// same as the original.
export interface AssetDongle {
  assetId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedAssetDongles {
  data: AssetDongle[];
  pagination: PaginationMeta;
}

// GET /api/v1/asset-dongle
export interface GetAllAssetDongleRequest {
  limit?: number;
  page?: number;
  search?: string;
}
export interface GetAllAssetDongleResponse {
  status: "success";
  data: PaginatedAssetDongles;
}

// POST /api/v1/asset-dongle
export interface CreateAssetDongleRequest {
  assetId: string;
}
export interface CreateAssetDongleResponse {
  status: "success";
  data: AssetDongle;
}

// DELETE /api/v1/asset-dongle/:assetId
export interface DeleteAssetDongleRequest {
  assetId: string;
}
export interface DeleteAssetDongleResponse {
  status: "success";
  data: null;
}
