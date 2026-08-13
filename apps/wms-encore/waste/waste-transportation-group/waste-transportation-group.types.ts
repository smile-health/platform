// Mirrors apps/wms-service's domain/entities/WasteTransportationGroup.ts
// field-for-field. The original entity types wasteBags/wasteClassification/
// partnership/vehicle as `any` (join/enrichment data assembled ad-hoc in
// WasteBagTransportGroupImpl — not columns on this table) — ported as
// Record<string, unknown> (never bare `object`) per convention.
export interface WasteTransportationGroup {
  id?: number;
  createdAt?: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  totalBagsCount?: number;
  totalWeightInKgs?: number;
  transporterVehicleId?: number;
  transporterOperatorId?: string;
  handoverLattitude?: number;
  handoverLongitude?: number;
  // DB enum('READY_FOR_TRANSPORT','TRANSPORTATION_REQUEST_CREATED') — see
  // waste-transportation-group.repository.ts's toTransportationStatus.
  transportationStatus: string;
  handoverTimestamp?: Date;
  isReadOnly?: boolean;
  groupId?: string;
  wasteBags?: Record<string, unknown>[];
  wasteClassification?: Record<string, unknown> | null;
  partnership?: Record<string, unknown> | null;
  vehicle?: Record<string, unknown> | null;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteTransportationGroups {
  data: WasteTransportationGroup[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-transportation-group
export interface GetAllWasteTransportationGroupsRequest {
  limit?: number;
  page?: number;
  date?: string;
  entityId?: number;
  status?: string;
}
export interface GetAllWasteTransportationGroupsResponse {
  status: "success";
  data: PaginatedWasteTransportationGroups;
}

// POST /api/v1/waste-transportation-group
export interface CreateWasteTransportationGroupRequest {
  wasteBagIds: number[];
  totalBagsCount: number;
  totalWeightInKgs: number;
  transporterVehicleId?: number;
  transporterOperatorId?: number;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus: string;
  handoverTimestamp?: Date;
}
export interface CreateWasteTransportationGroupResponse {
  status: "success";
  data: WasteTransportationGroup;
}

// GET /api/v1/waste-transportation-group/detail?id=&qrCodeId=
export interface GetWasteTransportationGroupByIdRequest {
  id?: string;
  qrCodeId?: string;
  authorization?: string;
}
export interface GetWasteTransportationGroupByIdResponse {
  status: "success";
  data: WasteTransportationGroup;
}

// PUT /api/v1/waste-transportation-group/:id
export interface UpdateWasteTransportationGroupRequest {
  id: string;
  totalBagsCount?: number;
  totalWeightInKgs?: number;
  transporterVehicleId?: number;
  transporterOperatorId?: number;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus?: string;
}
export interface UpdateWasteTransportationGroupResponse {
  status: "success";
  data: WasteTransportationGroup;
}

// DELETE /api/v1/waste-transportation-group/:id
export interface DeleteWasteTransportationGroupRequest {
  id: string;
}
export interface DeleteWasteTransportationGroupResponse {
  status: "success";
  data: boolean;
}
