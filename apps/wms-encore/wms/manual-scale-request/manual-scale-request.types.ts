import type { Query } from "encore.dev/api";

// Mirrors apps/wms-service's domain/entities/ManualScaleRequest.ts field-for-field.
// The original entity also carries readonly operatorName/processedName/entityName,
// populated in the repository impl via cross-service lookups (getUsersDetail /
// getEntityDetail against apps/wms-service's own thirdPartyClient).
// manual-scale-request.service.ts populates these from local tables only (see
// shared/core/entity-user-lookup.ts) — undefined only for an entity/user that
// has never authenticated against this app.
export interface ManualScaleRequest {
  id?: number;
  requestedBy: string;
  processedBy?: string;
  isActive: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WAITING_FOR_APPROVAL";
  approvalType?: "TIME_BOUND" | "COUNT_BASED";
  validUntil?: Date;
  countLimit?: number;
  entityId: number;
  createdAt?: Date;
  updatedAt?: Date;
  operatorName?: string;
  processedName?: string;
  entityName?: string;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedManualScaleRequests {
  data: ManualScaleRequest[];
  pagination: PaginationMeta;
}

// POST /api/v1/manual-scale-request
// Mirrors createManualScaleRequestSchemaBody. requestedBy/entityId come from
// the authenticated user in this port (req.user?.user_uuid / req.user?.entity.id
// in the original controller), not re-validated as body fields — same
// convention as every other ported module.
export interface CreateManualScaleRequestRequest {
  isActive?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  approvalType: "TIME_BOUND" | "COUNT_BASED";
  validUntil?: string;
  countLimit?: number;
}
export interface CreateManualScaleRequestResponse {
  status: "success";
  data: ManualScaleRequest;
}

// GET /api/v1/manual-scale-request
// Mirrors getAllManualScaleRequest's query params. entityId defaults to the
// caller's own entity unless they're super_admin — see
// manual-scale-request.controller.ts's getAllManualScaleRequests.
export interface GetAllManualScaleRequestsRequest {
  limit?: number;
  page?: number;
  entityId?: number;
  status?: string;
  isActive?: boolean;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
}
export interface GetAllManualScaleRequestsResponse {
  status: "success";
  data: PaginatedManualScaleRequests;
}

// PATCH /api/v1/manual-scale-request/activate
// Original: `PATCH /activate?id=&status=` — id/status arrive as query string
// params. Preserved on the wire via encore.dev's Query<T> marker (available
// in the installed 1.57.13), so this PATCH still takes id/status as query
// params instead of defaulting to a JSON body.
export interface ActivateManualScaleRequestRequest {
  id: Query<number>;
  status: Query<"APPROVED" | "REJECTED">;
}
export interface ActivateManualScaleRequestResponse {
  status: "success";
  data: ManualScaleRequest;
}

// POST /api/v1/manual-scale-request/:id/status
// Publisher-only skeleton, preserved as-is from before this migration phase —
// see manual-scale-request.service.ts's updateStatus.
export interface UpdateManualScaleRequestStatusRequest {
  id: number;
  previousStatus: string;
  newStatus: string;
}
export interface UpdateManualScaleRequestStatusResponse {
  status: "success";
  data: { manualScaleRequestId: number; newStatus: string };
}
