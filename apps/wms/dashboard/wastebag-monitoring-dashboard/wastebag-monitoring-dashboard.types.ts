// Mirrors apps/wms-service's domain/repositories/WasteBagMonitoringDashboardRepository.ts
// return shapes field-for-field, and the query params read off req.query in
// wasteBagMonitoringDashboardController.ts.
import type { Header } from "encore.dev/api";

// Common filter query params shared by every endpoint in this module.
// isBags is kept as a plain string (not boolean) — see gotcha #3; it is
// parsed manually via parseBoolean-equivalent logic in service.ts, exactly
// mirroring the original controller's `if (isBags) isBagsBool =
// parseBoolean(isBags.toString())`.
export interface WasteBagSummaryFilters {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  entityTag?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  isBags?: string;
}

// ---- GET /waste-group-summary-chart ----
export interface GetWasteGroupSummaryChartRequest extends WasteBagSummaryFilters {
  acceptLanguage?: Header<"Accept-Language">;
}
export interface WasteGroupSummaryRow {
  labelType: string;
  label: string;
  value: number;
}
export interface GetWasteGroupSummaryChartData {
  total: number;
  data: WasteGroupSummaryRow[];
}
export interface GetWasteGroupSummaryChartResponse {
  status: "success";
  data: GetWasteGroupSummaryChartData;
}

// ---- GET /waste-characteristics-summary-chart ----
export interface GetWasteCharacteristicsSummaryChartRequest extends WasteBagSummaryFilters {
  acceptLanguage?: Header<"Accept-Language">;
}
export interface LabelValueRow {
  label: string;
  value: number;
}
export interface GetWasteCharacteristicsSummaryChartResponse {
  status: "success";
  data: LabelValueRow[];
}

// ---- GET /monthly-waste-bag-summary-chart ----
export interface GetMonthlyWasteBagSummaryChartRequest extends WasteBagSummaryFilters {}
export interface GetMonthlyWasteBagSummaryChartResponse {
  status: "success";
  data: LabelValueRow[];
}

// ---- GET /province-waste-bag-summary-chart ----
export interface GetProvinceWasteBagSummaryChartRequest extends WasteBagSummaryFilters {
  orderBy?: string;
}
export interface GetProvinceWasteBagSummaryChartResponse {
  status: "success";
  data: LabelValueRow[];
}

// ---- GET /regency-waste-bag-summary-chart ----
export interface GetRegencyWasteBagSummaryChartRequest extends WasteBagSummaryFilters {
  orderBy?: string;
}
export interface GetRegencyWasteBagSummaryChartResponse {
  status: "success";
  data: LabelValueRow[];
}

// ---- GET /entity-waste-bag-summary-chart ----
export interface GetEntityWasteBagSummaryChartRequest extends WasteBagSummaryFilters {
  limit?: number;
  page?: number;
  orderBy?: string;
}
export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}
export interface EntityWasteBagSummaryRow {
  provinceName?: string;
  regencyName?: string;
  healthcareFacilityName: string;
  value: number;
}
export interface GetEntityWasteBagSummaryChartData {
  data: EntityWasteBagSummaryRow[];
  pagination: PaginationMeta;
}
export interface GetEntityWasteBagSummaryChartResponse {
  status: "success";
  data: GetEntityWasteBagSummaryChartData;
}

// ---- GET /entity-waste-bag-summary-by-group ----
export interface GetEntityWasteBagSummaryByGroupRequest extends WasteBagSummaryFilters {
  limit?: number;
  page?: number;
  orderBy?: string;
  acceptLanguage?: Header<"Accept-Language">;
}
export interface EntityWasteBagSummaryByGroupRow {
  provinceName?: string;
  regencyName?: string;
  healthcareFacilityName: string;
  wasteGroupName: string;
  value: number;
}
export interface GetEntityWasteBagSummaryByGroupData {
  data: EntityWasteBagSummaryByGroupRow[];
  pagination: PaginationMeta;
}
export interface GetEntityWasteBagSummaryByGroupResponse {
  status: "success";
  data: GetEntityWasteBagSummaryByGroupData;
}

// ---- GET /entity-waste-bag-summary-by-characteristics ----
export interface GetEntityWasteBagSummaryByCharacteristicsRequest extends WasteBagSummaryFilters {
  limit?: number;
  page?: number;
  orderBy?: string;
  acceptLanguage?: Header<"Accept-Language">;
}
export interface EntityWasteBagSummaryByCharacteristicsRow {
  provinceName?: string;
  regencyName?: string;
  healthcareFacilityName: string;
  wasteFullName: string;
  value: number;
  avgValue: number;
  maxValue: number;
  gapValue: number;
}
export interface GetEntityWasteBagSummaryByCharacteristicsData {
  data: EntityWasteBagSummaryByCharacteristicsRow[];
  pagination: PaginationMeta;
}
export interface GetEntityWasteBagSummaryByCharacteristicsResponse {
  status: "success";
  data: GetEntityWasteBagSummaryByCharacteristicsData;
}

// ---- GET /entity-waste-bag-summary-by-characteristics/export ----
// Raw endpoint (binary xlsx download), implemented via api.raw in the
// controller — it has no api()-decoded request/response types; query params
// are read manually off the raw request URL there.

// Internal input shape passed from controller -> service for every endpoint
// in this module (mirrors the filters above plus limit/page/orderBy/lang,
// which the original use-cases take as positional args).
export interface WasteBagSummaryQueryInput {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  entityTag?: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  isBags?: boolean;
  orderBy?: string;
  lang?: string;
}
