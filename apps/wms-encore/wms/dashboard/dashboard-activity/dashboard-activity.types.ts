// Mirrors apps/wms-service's domain/entities/Dashboard.ts `DashboardWasteHierarchy`
// (`{ healthcareFacilityId?: number | string; [key: string]: any }`) — the pivot
// rows have a handful of known columns plus one dynamic column per day-of-month
// (keys "1".."31"), so this is modeled as an open-ended map rather than a bare
// `object` (see gotcha #2 — Encore's schema generator rejects bare `object` in an
// api() response).
export type ActivitySummaryRow = Record<string, unknown>;

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedActivityRows {
  data: ActivitySummaryRow[];
  pagination: PaginationMeta;
}

export interface UserActivitySummary {
  totalEntities: number;
  activeEntities: number;
  inactiveEntities: number;
}

// Shared filter shape used by every endpoint below — all fields arrive as query
// params. typeOfProcessing is a plain string (never a union — see gotcha #3):
// the original only special-cases the literal 'IN' vs everything else.
export interface ActivityFilters {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  entityTag?: string;
  typeOfProcessing?: string;
}

// ---- GET /api/v1/dashboard/summary-activity-entities ----
export interface GetActivitySummariesForEntitiesRequest extends ActivityFilters {
  limit?: number;
  page?: number;
}
export interface GetActivitySummariesForEntitiesResponse {
  status: "success";
  data: PaginatedActivityRows;
}

// ---- GET /api/v1/dashboard/manual-scale-activity-entities ----
// Original's use-case/repo pair for this endpoint has no typeOfProcessing param.
export interface GetActivityManualScaleForEntitiesRequest {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  entityTag?: string;
}
export interface GetActivityManualScaleForEntitiesResponse {
  status: "success";
  data: PaginatedActivityRows;
}

// ---- GET /api/v1/dashboard/summary-users-activity ----
export interface GetUserActivitySummaryRequest extends ActivityFilters {}
export interface GetUserActivitySummaryResponse {
  status: "success";
  data: UserActivitySummary;
}

// ---- GET /api/v1/dashboard/summary-activity-entities/export ----
// Ported as an api.raw endpoint (binary .xlsx response) — its query params are
// parsed manually off the raw request URL in the controller, not decoded by
// Encore's api() request-type machinery, so this type is for internal
// controller -> service wiring only.
export interface ExportActivitySummariesForEntitiesQuery extends ActivityFilters {}
