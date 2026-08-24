// Mirrors apps/wms-service's domain/entities/WasteTransportationRequest.ts
// field-for-field. requestStatus is a plain string here (not a union) per
// convention — validated against the 'PENDING'|'ACCEPTED'|'REJECTED' enum
// manually via Zod in waste-transportation-request.service.ts.
export interface WasteTransportationRequest {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  requestStatus?: string;
  transportationGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
  // Joined summary from waste_transportation_group (belongsTo, FK
  // transportation_group_id) — only the attributes the original explicitly
  // selects in its `include` (see WasteTransportationGroupRepoitoryImpl's
  // getWasteTransportationRequestById / getAllWasteTransportationRequests).
  // That sibling table is being built in parallel in ../waste-transportation-group/
  // — kept as a loose summary shape here rather than importing its types, so
  // this module doesn't take on a hard compile-time dependency on work in
  // flight elsewhere.
  transportationGroup?: WasteTransportationGroupSummary;
}

export interface WasteTransportationGroupSummary {
  id?: number;
  createdBy?: string;
  updatedBy?: string;
  totalBagsCount?: number;
  totalWeightInKgs?: number;
  transporterVehicleId?: number;
  transporterOperatorId?: string;
  handoverLattitude?: number;
  handoverLongitude?: number;
  transportationStatus?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteTransportationRequests {
  data: WasteTransportationRequest[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-transportation-request/:id
export interface GetWasteTransportationRequestByIdRequest {
  id: string;
}
export interface GetWasteTransportationRequestByIdResponse {
  status: "success";
  data: WasteTransportationRequest;
}

// GET /api/v1/waste-transportation-request
export interface GetAllWasteTransportationRequestsRequest {
  limit?: number;
  page?: number;
  search?: string;
}
export interface GetAllWasteTransportationRequestsResponse {
  status: "success";
  data: PaginatedWasteTransportationRequests;
}

// POST /api/v1/waste-transportation-request
export interface CreateWasteTransportationRequestRequest {
  requestStatus?: string;
  transportationGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}
export interface CreateWasteTransportationRequestResponse {
  status: "success";
  data: WasteTransportationRequest;
}

// PUT /api/v1/waste-transportation-request/:id
export interface UpdateWasteTransportationRequestRequest {
  id: string;
  requestStatus?: string;
  transportationGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}
export interface UpdateWasteTransportationRequestResponse {
  status: "success";
  data: WasteTransportationRequest;
}

// DELETE /api/v1/waste-transportation-request/:id
export interface DeleteWasteTransportationRequestRequest {
  id: string;
}
export interface DeleteWasteTransportationRequestResponse {
  status: "success";
  data: boolean;
}
