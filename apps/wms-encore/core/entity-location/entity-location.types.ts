// Mirrors apps/wms-service's domain/entities/EntityLocation.ts field-for-field,
// plus the application/dtos/EntityLocationDTO.ts fields used by create/update.
export interface EntityLocation {
  id: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  entityId: number;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters?: number;
  address?: string;
  provinceId?: number;
  cityId?: number;
  provinceName?: string;
  cityName?: string;
  // Original domain entity types this as a union; kept as a union here too since
  // it is never itself decoded as an api() request/query field (see gotcha #3 —
  // that rule only applies to fields Encore decodes directly off the wire).
  locationType?: "STORAGE" | "TREATMENT";
  entityName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedEntityLocations {
  data: EntityLocation[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/entity-location/:id ----
export interface GetEntityLocationByIdRequest {
  id: string;
}
export interface GetEntityLocationByIdResponse {
  status: "success";
  data: EntityLocation;
}

// ---- GET /api/v1/entity-location ----
export interface GetAllEntityLocationRequest {
  limit?: number;
  page?: number;
  search?: string;
  // plain string, not a union — see gotcha #3; validated manually in service.ts
  locationType?: string;
}
export interface GetAllEntityLocationResponse {
  status: "success";
  data: EntityLocation[] | PaginatedEntityLocations;
}

// ---- GET /api/v1/entity-location/list ----
export interface GetAllEntityLocationByEntityRequest {
  entityId?: string;
  healtcareFacilityId?: number;
  wasteClassificationId?: number;
}
export interface GetAllEntityLocationByEntityResponse {
  status: "success";
  data: EntityLocation[];
}

// ---- POST /api/v1/entity-location ----
export interface CreateEntityLocationRequest {
  entityId?: number;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters?: number;
  address?: string;
  provinceId?: number;
  cityId?: number;
  provinceName?: string;
  cityName?: string;
}
export interface CreateEntityLocationResponse {
  status: "success";
  data: EntityLocation;
}

// ---- PUT /api/v1/entity-location/:id ----
export interface UpdateEntityLocationRequest {
  id: string;
  entityId?: number;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceLimitInMeters?: number;
  address?: string;
  provinceId?: number;
  cityId?: number;
  provinceName?: string;
  cityName?: string;
}
export interface UpdateEntityLocationResponse {
  status: "success";
  data: EntityLocation;
}

// ---- DELETE /api/v1/entity-location/:id ----
export interface DeleteEntityLocationRequest {
  id: string;
}
export interface DeleteEntityLocationResponse {
  status: "success";
  data: boolean;
}

// ---- PATCH /api/v1/mobile/validate/distance-limit ----
export interface ValidateDistanceLimitRequest {
  id: number;
  longitude: number;
  latitude: number;
}
export interface ValidateDistanceLimitResponse {
  status: "success";
  data: { result: boolean; distance: number };
}

// Internal shape passed from controller -> service for create/update, carrying
// values the original controller derived from req.user (auth) rather than the
// request body.
export interface CreateEntityLocationInput extends CreateEntityLocationRequest {
  createdBy: string;
  locationType: string; // plain string — derived server-side, not client-supplied
  entityTag: string;
}

export interface UpdateEntityLocationInput extends UpdateEntityLocationRequest {
  updatedBy: string;
}

export interface GetAllEntityLocationInput {
  limit?: number;
  page?: number;
  search?: string;
  locationType?: string;
  entityId: string;
  tag?: string;
  isSuperAdmin: boolean;
}
