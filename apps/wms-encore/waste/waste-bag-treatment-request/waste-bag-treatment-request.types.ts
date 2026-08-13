// Mirrors apps/wms-service's domain/entities/WasteBagTreatmentRequest.ts
// field-for-field. The original entity also carries a denormalized
// `wasteBagTreatmentGroup` (WasteBagTreatmentGroupModelAttributes) populated
// via a Sequelize `belongsTo` include — dropped here since no read path in
// the original repository impl actually populates it (the impl never
// includes the association), so it was always undefined in practice.
export interface WasteBagTreatmentRequest {
  id?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  requestStatus?: string; // enum: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  treatmentGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedWasteBagTreatmentRequest {
  data: WasteBagTreatmentRequest[];
  pagination: PaginationMeta;
}

// GET /api/v1/waste-bag-treatment-request/:id
export interface GetWasteBagTreatmentRequestByIdRequest {
  id: string;
}
export interface GetWasteBagTreatmentRequestByIdResponse {
  status: "success";
  data: WasteBagTreatmentRequest;
}

// GET /api/v1/waste-bag-treatment-request
export interface GetAllWasteBagTreatmentRequestsRequest {
  limit?: number;
  page?: number;
  search?: string;
}
export interface GetAllWasteBagTreatmentRequestsResponse {
  status: "success";
  data: PaginatedWasteBagTreatmentRequest;
}

// POST /api/v1/waste-bag-treatment-request
export interface CreateWasteBagTreatmentRequestRequest {
  requestStatus: string; // enum: 'PENDING' | 'ACCEPTED' | 'REJECTED', required (matches createWasteBagTreatmentRequest.schema.ts — no .optional())
  treatmentGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}
export interface CreateWasteBagTreatmentRequestResponse {
  status: "success";
  data: WasteBagTreatmentRequest;
}

// PUT /api/v1/waste-bag-treatment-request/:id
export interface UpdateWasteBagTreatmentRequestRequest {
  id: string;
  requestStatus: string; // enum, required (matches updateWasteBagTreatmentRequest.schema.ts — no .optional())
  treatmentGroupId: number;
  requestCreatorId?: number;
  requestApproverId?: number;
}
export interface UpdateWasteBagTreatmentRequestResponse {
  status: "success";
  data: WasteBagTreatmentRequest;
}

// DELETE /api/v1/waste-bag-treatment-request/:id
export interface DeleteWasteBagTreatmentRequestRequest {
  id: string;
}
export interface DeleteWasteBagTreatmentRequestResponse {
  status: "success";
  data: boolean;
}
