// Mirrors apps/wms-service's domain/entities/AssetManufacturer.ts field-for-field.
// (The original also carries an optional `assetModels` association array —
// dropped here since nothing in the ported use-cases ever populates it; the
// repository methods being ported never join asset_model.)
export interface AssetManufacturer {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  name: string;
  description?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedAssetManufacturers {
  data: AssetManufacturer[];
  pagination: PaginationMeta;
}

// GET /api/v1/asset
export interface GetAllAssetManufacturersRequest {
  limit?: number;
  page?: number;
  search?: string;
  // Accepted by the original controller/use-case signature but never actually
  // applied to the query in AssetManufacturerRepositoryImpl.getAllAssetManufacturers
  // (only `search` and `name` affect the `where` clause) — preserved as a
  // no-op field for byte-for-byte parity.
  assetType?: string;
  name?: string;
}
export interface GetAllAssetManufacturersResponse {
  status: "success";
  data: PaginatedAssetManufacturers;
}

// GET /api/v1/asset/:id
export interface GetAssetManufacturerByIdRequest {
  id: string;
}
export interface GetAssetManufacturerByIdResponse {
  status: "success";
  data: AssetManufacturer;
}

// POST /api/v1/asset
export interface CreateAssetManufacturerRequest {
  name: string;
  description?: string;
}
export interface CreateAssetManufacturerResponse {
  status: "success";
  data: AssetManufacturer;
}

// PUT /api/v1/asset/:id
export interface UpdateAssetManufacturerRequest {
  id: string;
  name: string;
  description?: string;
}
export interface UpdateAssetManufacturerResponse {
  status: "success";
  data: AssetManufacturer;
}

// DELETE /api/v1/asset/:id
export interface DeleteAssetManufacturerRequest {
  id: string;
}
export interface DeleteAssetManufacturerResponse {
  status: "success";
  data: boolean;
}
