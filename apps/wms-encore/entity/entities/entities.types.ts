// Mirrors apps/wms-service's domain/entities/Entities.ts field-for-field.
export interface Entities {
  id?: number;
  name?: string | null;
  type?: number | null;
  address?: string | null;
  tag?: string | null;
  provinceId?: string | null;
  regencyId?: string | null;
  subDistrictId?: string | null;
  villageId?: string | null;
  integrationType?: number | null;
  integrationClientId?: number | null;
  location?: string | null;
  // Encore's schema generator rejects a bare `object` type ("unsupported basic
  // type in schema: Object") for anything reachable from an api() response —
  // Record<string, unknown> is the supported equivalent for an open-ended map.
  externalProperties?: Record<string, unknown> | null;
  entityTypeId?: number | null;
  // TODO: no `entity_type` lookup table (or denormalized name column) exists
  // in wms-encore's schema — the old wms-service stored entity_type_name/
  // entity_type_integration_type/entity_type_external_properties as flat,
  // separately-synced columns directly on `entities` (not a join), and that
  // sync mechanism was never ported. Left unpopulated rather than guessed;
  // needs a real decision (add denormalized columns + sync job, or a real
  // entity_type table) before this can be filled in.
  entityTypeName?: string | null;
  entityTypeIntegrationType?: number | null;
  entityTypeExternalProperties?: string | null;
  provinceName?: string | null;
  regencyName?: string | null;
  districtName?: string | null;
  updatedAt?: Date | null;
  code?: string | null;
  nib?: string | null;
  headName?: string | null;
  email?: string | null;
  gender?: number | null;
  mobilePhone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  idSatuSehat?: number | null;
  totalBadRoom?: number | null;
  percentageBadRoom?: number | null;
  isActive?: boolean;
  countDongle?: number | null;
}

export interface EntitiesPagination {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface EntitiesListResult {
  data: Entities[];
  pagination: EntitiesPagination;
}

// GET /api/v1/entities
export interface GetEntitiesByIdRequest {
  entityId?: string;
}
export interface GetEntitiesByIdResponse {
  status: "success";
  data: Entities | null;
}

// GET /api/v1/entities/all
export interface GetAllEntitiesRequest {
  entityTypeId?: string;
  entityId?: string;
  groupBy?: string;
  attributes?: string;
  limit?: string;
  page?: string;
  search?: string;
  provinceId?: string;
  regencyId?: string;
  isActive?: string;
}
export interface GetAllEntitiesResponse {
  status: "success";
  // The original controller returns the literal string "No entities found"
  // (via res.success) when the use-case resolves to null, instead of the
  // {data,pagination} shape — carried over verbatim rather than "fixed" here.
  data: EntitiesListResult | string;
}

// PATCH /api/v1/entities
export interface UpdateEntitiesRequestBody {
  nib?: string;
  mobile_phone?: string;
  head_name?: string;
  email?: string;
  gender?: number;
  total_bad_room?: number;
  percentage_bad_room?: number;
}
export interface UpdateEntitiesResponse {
  status: "success";
  // UpdateEntitiesUseCase.execute returns a *string* message (never null) for
  // its "id required" / "not found" branches, so entitiesController.ts's
  // `if (data === null) res.fail(...)` never actually fires — those branches
  // fall through to res.success(<string>) in the original. Preserved
  // verbatim (a real bug upstream, not something to "fix" during the port —
  // see entities.service.ts).
  data: Entities | string;
}

// PUT /api/v1/entities/:id
export interface UpdateStatusEntitiesRequest {
  id: string;
  // plain, not a union — validated via Zod in entities.schema.ts (gotcha #3)
  is_active: boolean | number;
}
export interface UpdateStatusEntitiesResponse {
  status: "success";
  data: Entities;
}
