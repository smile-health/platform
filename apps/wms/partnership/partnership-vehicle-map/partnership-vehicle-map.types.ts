// Mirrors apps/wms-service's domain/entities/PartnershipVehicleMap.ts field-for-field,
// enriched with the nested `partnerVehicle` summary the original repository's
// getAllPartnershipVehicleMaps() join returns (see PartnershipVehicleMapRepoitoryImpl.ts).
// There is no `id`/timestamps on this entity — partnership_id + vehicle_id is the
// composite primary key in the original Sequelize model.

export interface PartnerVehicleSummary {
  id: number;
  entityId: number;
  // Original domain entity types this as a union (PartnerVehicleModel's
  // DataTypes.ENUM list); kept as a union here too since it is never itself
  // decoded as an api() request/query field (see gotcha #3 — that rule only
  // applies to fields Encore decodes directly off the wire).
  vehicleType:
    | "BOX_TRUCK"
    | "REFRIGERATED_BOX_TRUCK"
    | "OPEN_BODY_TRUCK"
    | "TANKER"
    | "HAZARDOUS_MATERIAL_TRUCK"
    | "RADIOACTIVE_MATERIAL_TRUCK"
    | "FLATBED_TRUCK"
    | "LOADER_TRUCK"
    | "TRAILER"
    | "VAN";
  vehicleNumber: string;
  capacityInKgs: number;
}

export interface PartnershipVehicleMap {
  partnershipId: number;
  vehicleId: number;
  partnerVehicle?: PartnerVehicleSummary;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedPartnershipVehicleMaps {
  data: PartnershipVehicleMap[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/partnership-vehicle-map ----
export interface GetAllPartnershipVehicleMapRequest {
  limit?: number;
  page?: number;
  search?: string;
}
export interface GetAllPartnershipVehicleMapResponse {
  status: "success";
  data: PaginatedPartnershipVehicleMaps;
}

// ---- POST /api/v1/partnership-vehicle-map ----
export interface CreatePartnershipVehicleMapRequest {
  partnershipId: number;
  vehicleId: number;
}
export interface CreatePartnershipVehicleMapResponse {
  status: "success";
  data: PartnershipVehicleMap;
}

// ---- DELETE /api/v1/partnership-vehicle-map ----
export interface DeletePartnershipVehicleMapRequest {
  partnership_id?: string;
  vehicle_id?: string;
}
export interface DeletePartnershipVehicleMapResponse {
  status: "success";
  data: boolean;
}

// Internal shape passed from controller -> service, carrying values the
// original controller derived from req.user (auth) rather than the request
// body/query.
export interface GetAllPartnershipVehicleMapInput {
  limit?: number;
  page?: number;
  search?: string;
  // Original: `search?.toString() ?? req.user?.entity.id.toString()` — the
  // auth-derived entityId used as a fallback search value when no `search`
  // query param is supplied.
  authEntityId: string;
}

export interface DeletePartnershipVehicleMapInput {
  partnershipId?: string;
  vehicleId?: string;
  deletedBy?: string;
}
