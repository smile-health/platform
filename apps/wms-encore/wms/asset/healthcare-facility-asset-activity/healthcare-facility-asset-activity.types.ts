// Mirrors apps/wms-service's domain/entities/HealthcareFacilityAssetActivity.ts
// field-for-field. activityType is a plain string here (Encore api() request
// fields must never be a union type) — validated against the
// 'MAINTENANCE' | 'CALIBRATION' enum manually via Zod in service.ts.
export interface HealthcareFacilityAssetActivity {
  createdBy: string;
  activityType: string;
  hfAssetId: number;
  operatorId: string;
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
}

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedHealthcareFacilityAssetActivity {
  data: HealthcareFacilityAssetActivity[];
  pagination: PaginationMeta;
}

// POST /api/v1/healthcare-facility-asset-activity
// The original DTO's createdAt/startDate/endDate are Date, but the request
// schema validates them as strings off the wire (z.string().date() /
// z.string()) — mirrored here as strings, parsed to Date in service.ts.
export interface CreateHealthcareFacilityAssetActivityRequest {
  activityType: string;
  hfAssetId: number;
  operatorId: string;
  createdAt: string;
  startDate: string;
  endDate?: string;
}
export interface CreateHealthcareFacilityAssetActivityResponse {
  status: "success";
  data: HealthcareFacilityAssetActivity;
}

// GET /api/v1/healthcare-facility-asset-activity
export interface GetAllHealthcareFacilityAssetActivityRequest {
  limit?: number;
  page?: number;
  activityType?: string;
  hfAssetId?: number;
}
export interface GetAllHealthcareFacilityAssetActivityResponse {
  status: "success";
  data: PaginatedHealthcareFacilityAssetActivity;
}
