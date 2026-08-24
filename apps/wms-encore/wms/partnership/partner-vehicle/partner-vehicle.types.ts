// Mirrors apps/wms-service's domain/entities/PartnerVehicle.ts field-for-field,
// plus the application/dtos/CreatePartnerVehicleDTO.ts / UpdatePartnerVehicleDTO.ts
// fields used by create/update.
export interface PartnerVehicle {
  id: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  entityId: number;
  // Original domain entity types this as a union; kept as a union here too
  // since it is never itself decoded as an api() request/query field (see
  // gotcha #3 — that rule only applies to fields Encore decodes directly off
  // the wire). Plain-string equivalents are used on every request type below.
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
  // Populated via a cross-service lookup (getEntityDetail) against apps/core
  // in the original; ported here as a local join against this DB's `entities`
  // table (see partner-vehicle.repository.ts's findById/findPaginated).
  entityName?: string;
  transporterId?: number;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedPartnerVehicles {
  data: PartnerVehicle[];
  pagination: PaginationMeta;
}

// ---- GET /api/v1/partner-vehicle/:id ----
export interface GetPartnerVehicleByIdRequest {
  id: string;
}
export interface GetPartnerVehicleByIdResponse {
  status: "success";
  data: PartnerVehicle;
}

// ---- GET /api/v1/partner-vehicle ----
export interface GetAllPartnerVehiclesRequest {
  limit?: number;
  page?: number;
  search?: string;
  healthcareFacilityId?: number;
  providerId?: number;
}
export interface GetAllPartnerVehiclesResponse {
  status: "success";
  data: PaginatedPartnerVehicles;
}

// ---- GET /api/v1/partner-vehicle/export ----
// Original streams an .xlsx binary with Content-Disposition/Content-Type
// headers set directly on the Express response. Encore's typed api()
// handlers must return JSON-serializable data, so this port returns the
// workbook as a base64 string alongside the filename the original would have
// set — the caller is responsible for decoding/saving it. This is a
// necessary adaptation, not a faithful byte-for-byte port of the transport.
export interface GetPartnerVehicleExportExcelRequest {
  search?: string;
  healthcareFacilityId?: number;
}
export interface GetPartnerVehicleExportExcelResponse {
  status: "success";
  data: {
    filename: string;
    contentType: string;
    base64: string;
  };
}

// ---- POST /api/v1/partner-vehicle ----
export interface CreatePartnerVehicleRequest {
  // plain string, not a union — see gotcha #3; validated manually in service.ts
  vehicleType: string;
  vehicleNumber: string;
  capacityInKgs: number;
  entityId: number;
}
export interface CreatePartnerVehicleResponse {
  status: "success";
  data: PartnerVehicle;
}

// ---- POST /api/v1/partner-vehicle/bulk-healthcare ----
export interface CreateMultipleHealthcarePartnerVehicleRequest {
  vehicleType: string;
  vehicleNumber: string;
  capacityInKgs: number;
  entityIds: string;
}
export interface CreateMultipleHealthcarePartnerVehicleResponse {
  status: "success";
  data: PartnerVehicle;
}

// ---- PUT /api/v1/partner-vehicle/:id ----
export interface UpdatePartnerVehicleRequest {
  id: string;
  vehicleType: string;
  vehicleNumber: string;
  capacityInKgs: number;
  entityId: number;
}
export interface UpdatePartnerVehicleResponse {
  status: "success";
  data: PartnerVehicle;
}

// ---- DELETE /api/v1/partner-vehicle/:id ----
export interface DeletePartnerVehicleRequest {
  id: string;
}
export interface DeletePartnerVehicleResponse {
  status: "success";
  data: boolean;
}

// Internal shapes passed from controller -> service, carrying values the
// original controller derived from req.user (auth) rather than the request
// body/query.
export interface CreatePartnerVehicleInput extends CreatePartnerVehicleRequest {
  createdBy: string;
  transporterId?: number;
}

export interface CreateMultipleHealthcarePartnerVehicleInput
  extends CreateMultipleHealthcarePartnerVehicleRequest {
  createdBy: string;
  transporterId?: number;
}

export interface UpdatePartnerVehicleInput extends UpdatePartnerVehicleRequest {
  updatedBy: string;
}

export interface GetAllPartnerVehiclesInput extends GetAllPartnerVehiclesRequest {
  transporterId: number;
  entityTag?: string;
}

export interface GetPartnerVehicleExportExcelInput extends GetPartnerVehicleExportExcelRequest {
  transporterId: number;
  entityTag?: string;
  lang: string;
}

export interface DeletePartnerVehicleInput {
  id: string;
  deletedBy?: number;
}
