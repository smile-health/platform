// Mirrors apps/wms-service's domain/entities/PartnershipOperatorMap.ts field-for-field
// (composite primary key: partnershipId + operatorId — the original
// PartnershipOperatorMapModel has no id/timestamps, only partnership_id,
// operator_id, deleted_at, deleted_by). consumerName/operatorName/userName/
// firstName/lastName/entityName/email/mobilePhone/userRole are populated via
// a local join against this DB's `users`/`entities` tables (ported — see
// partnership-operator-map.repository.ts's findOperatorDetail/getEntityId
// usage and its header comment for why this is a local join rather than an
// HTTP call to apps/core). `entityType`/`companyType` remain undefined: the
// original's entityType comes from an `entity_type` master table that isn't
// part of this port's schema at all, so it isn't derivable locally.
export interface PartnershipOperatorMap {
  partnershipId: number;
  operatorId: string;
  consumerName?: string;
  operatorName?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  entityName?: string;
  entityType?: string;
  email?: string;
  mobilePhone?: string;
  userRole?: string;
  companyType?: string;
}

// Mirrors domain/entities/PartnershipOperatorMap.ts's OperatorsSelectDTO.
export interface OperatorsSelect {
  operatorId: string;
  operatorName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedPartnershipOperatorMaps {
  data: PartnershipOperatorMap[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/partnership-operator-map ----
export interface GetAllPartnershipOperatorMapsRequest {
  limit?: number;
  page?: number;
  search?: string;
  providerId?: number;
}
export interface GetAllPartnershipOperatorMapsResponse {
  status: "success";
  data: PaginatedPartnershipOperatorMaps;
}

// ---- GET /api/v1/partnership-operator-map/operator-thirdparty ----
export interface GetAllPartnershipOperatorMapsByThirdpartyAdminRequest {
  limit?: number;
  page?: number;
  search?: string;
  operatorId?: string;
}
export interface GetAllPartnershipOperatorMapsByThirdpartyAdminResponse {
  status: "success";
  data: PaginatedPartnershipOperatorMaps;
}

// ---- POST /api/v1/partnership-operator-map ----
export interface CreatePartnershipOperatorMapRequest {
  partnershipId: number;
  operatorId: string;
}
export interface CreatePartnershipOperatorMapResponse {
  status: "success";
  data: PartnershipOperatorMap;
}

// ---- PUT /api/v1/partnership-operator-map ----
// Original: the query string (`partnership_id`/`operator_id`) carries the
// identity of the *existing* row to update; the body carries the *new*
// partnershipId/operatorId values to write onto that row (a composite-key
// "rename" — see updatePartnershipOperatorMap.schema.ts / the use-case).
export interface UpdatePartnershipOperatorMapRequest {
  partnership_id?: string;
  operator_id?: string;
  partnershipId: number;
  operatorId: string;
}
export interface UpdatePartnershipOperatorMapResponse {
  status: "success";
  data: PartnershipOperatorMap;
}

// ---- DELETE /api/v1/partnership-operator-map ----
export interface DeletePartnershipOperatorMapRequest {
  partnership_id?: string;
  operator_id?: string;
}
export interface DeletePartnershipOperatorMapResponse {
  status: "success";
  data: boolean;
}

// ---- GET /api/v1/partnership-operator-map/operator-from-operatormap ----
export interface GetOperatorsFromOperatorMapResponse {
  status: "success";
  data: OperatorsSelect[];
}

// Internal shapes passed from controller -> service, carrying values the
// original controller derived from req.user (auth) / the bearer token rather
// than the request body/query.
export interface DeletePartnershipOperatorMapInput {
  partnershipId?: string;
  operatorId?: string;
  deletedBy?: number;
}

export interface GetOperatorsFromOperatorMapInput {
  entityId?: number;
}
