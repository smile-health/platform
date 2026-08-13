// Mirrors apps/wms-service's domain/entities/Dashboard.ts. This module is the
// third piece of the dashboard domain (distinct from dashboard-activity and
// wastebag-monitoring-dashboard, which are already ported siblings) — it
// covers dashboardController.ts's remaining /dashboard/* routes: the
// waste-hierarchy pivot summaries, the third-party (transporter/treatment)
// waste-group listings, waste-group action details, waste-characteristics
// summary, and the today's-summary widget.

export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

// Mirrors DashboardWasteHierarchy (`{ healthcareFacilityId?: number | string;
// [key: string]: any }`) — every pivot-summary endpoint below returns a
// handful of known columns plus one dynamic column per distinct
// waste_type_id encountered in the matched rows, so this is modeled as an
// open-ended map rather than a bare `object` (Encore's schema generator
// rejects bare `object` in an api() response).
export type WasteHierarchyPivotRow = Record<string, unknown>;

export interface PaginatedWasteHierarchyRows {
  data: WasteHierarchyPivotRow[];
  pagination: PaginationMeta;
}

// Mirrors DashboardHealthcare field-for-field, PLUS the extra columns the
// original's raw SQL actually selects but the domain entity class omits
// (wasteStatus, disposalMethod, groupId, treatmentType) — a pre-existing
// mismatch between the entity class and the repository's real SELECT list,
// preserved here since the controller returns the raw SQL row, not an
// entity instance.
export interface DashboardHealthcareRow {
  wasteGroupNumber?: string | number | null;
  wasteTypeName?: string;
  wasteGroupName?: string;
  wasteCharacteristicsName?: string;
  wasteTypeNameEn?: string;
  wasteGroupNameEn?: string;
  wasteCharacteristicsNameEn?: string;
  wasteSource?: string | null;
  wasteInDate?: Date;
  storageDateLimit?: Date | null;
  totalWeightInKgs?: number;
  lastFollowUp?: string | null;
  wasteStatus?: string;
  disposalMethod?: string | null;
  healthcareFacilityId?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  transporterOperatorId?: string | null;
  treatmentOperatorId?: string | null;
  groupId?: number | null;
  treatmentType?: "IN" | "EX";
  // Cross-service enrichment (apps/core's user lookup, `getUsersDetail` in
  // the original) is populated from the local `users` table instead — see
  // dashboard.repository.ts's getWasteGroupByAdminHealthcareFacility.
  transporterOperatorName?: string | null;
  treatmentOperatorName?: string | null;
}

export interface PaginatedDashboardHealthcareRows {
  data: DashboardHealthcareRow[];
  pagination: PaginationMeta;
}

// Mirrors DashboardThirdParty, widened with the extra columns
// getWasteGroupByTreatmentAll's branches select that the entity class omits
// (transporterName, thirdPartyName, handOverTime) — same
// entity-vs-real-SELECT mismatch as DashboardHealthcareRow above.
export interface DashboardThirdPartyRow {
  wasteGroupId?: number;
  wasteGroupNumber?: string | number | null;
  totalWeightInKgs?: number;
  healthcareFacilityId?: number;
  vehicleNumber?: string | null;
  provinceId?: number;
  cityId?: number;
  transporterOperatorId?: string | null;
  treatmentOperatorId?: string | null;
  transporterOperatorName?: string | null;
  treatmentOperatorName?: string | null;
  manifestNumber?: string | null;
  healthcareName?: string;
  transporterName?: string | null;
  thirdPartyName?: string | null;
  handOverTime?: string | Date | null;
}

export interface PaginatedDashboardThirdPartyRows {
  data: DashboardThirdPartyRow[];
  pagination: PaginationMeta;
}

// Mirrors DashboardWasteGroupDetailsByAction. Field name in the original SQL
// alias is `wasteBagStatus`, not `wasteStatus` — kept verbatim (a difference
// from the entity class's `wasteStatus` field, which the original's actual
// row shape never populates either).
export interface DashboardWasteGroupDetailsByActionRow {
  wasteBagStatus?: string;
  updatedAtStatus?: Date;
}

export interface PaginatedWasteGroupDetailsByActionRows {
  data: DashboardWasteGroupDetailsByActionRow[];
  pagination: PaginationMeta;
}

// Mirrors DashboardWasteCharacteristicsSummary field-for-field.
export interface DashboardWasteCharacteristicsSummaryRow {
  wasteGroupName?: string;
  wasteCharacteristicsName?: string;
  wasteCode?: string;
  totalWasteBag?: number;
  totalWeight?: number;
}

export interface WasteCharacteristicsSummaryData {
  data: DashboardWasteCharacteristicsSummaryRow[];
}

export interface SummaryPerDayBucket {
  totalBags: number;
  totalWeight: string;
}

export interface SummaryPerDayData {
  wasteBagOutResult: SummaryPerDayBucket;
  wasteBagThisDay: SummaryPerDayBucket;
}

// ---- GET /api/v1/dashboard/waste-hierarchy-summary ----
export interface GetSummaryWasteHierarchyRequest {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}
export interface GetSummaryWasteHierarchyResponse {
  status: "success";
  data: PaginatedWasteHierarchyRows;
}

// ---- GET /api/v1/dashboard/provinces/:provinceId/waste-hierarchy-summary ----
export interface GetSummaryWasteHierarchyByProvinceRequest {
  provinceId: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}
export interface GetSummaryWasteHierarchyByProvinceResponse {
  status: "success";
  data: PaginatedWasteHierarchyRows;
}

// ---- GET /api/v1/dashboard/cities/:cityId/waste-hierarchy-summary ----
export interface GetSummaryWasteHierarchyByCityRequest {
  cityId: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  healthcareFacilityId?: number;
}
export interface GetSummaryWasteHierarchyByCityResponse {
  status: "success";
  data: PaginatedWasteHierarchyRows;
}

// ---- GET /api/v1/dashboard/waste-groups/admin-healthcare-facilities ----
export interface GetWasteGroupByAdminHealthcareFacilityRequest {
  limit?: number;
  page?: number;
  wasteTypeId?: number;
  healthcareFacilityId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  wasteStatus?: string;
  search?: string;
}
export interface GetWasteGroupByAdminHealthcareFacilityResponse {
  status: "success";
  data: PaginatedDashboardHealthcareRows;
}

// ---- GET /api/v1/dashboard/waste-groups/transporter ----
export interface GetWasteGroupByTransporterRequest {
  limit?: number;
  page?: number;
  healthcareFacilityId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}
export interface GetWasteGroupByTransporterResponse {
  status: "success";
  data: PaginatedDashboardThirdPartyRows;
}

// ---- GET /api/v1/dashboard/waste-groups/treatment ----
// disposalTreatment is a plain string, never a union — the original only
// special-cases a fixed set of literal values ('TREATMENT'/'LANDFILLER'/
// 'RECYCLER'/'SPECIALIZED'/'GOVERNMENT'/'GOVERNMENT_WASTE_BANK') and falls
// through to an unfiltered query for anything else.
export interface GetWasteGroupByTreatmentRequest {
  limit?: number;
  page?: number;
  disposalTreatment: string;
  healthcareFacilityId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}
export interface GetWasteGroupByTreatmentResponse {
  status: "success";
  data: PaginatedDashboardThirdPartyRows;
}

// ---- GET /api/v1/dashboard/waste-groups-details/:wasteGroupId ----
export interface GetWasteGroupDetailsByActionRequest {
  wasteGroupId: string;
  limit?: number;
  page?: number;
  treatmentType?: string;
}
export interface GetWasteGroupDetailsByActionResponse {
  status: "success";
  data: PaginatedWasteGroupDetailsByActionRows;
}

// ---- GET /api/v1/dashboard/waste-characteristics-summary ----
// wasteTypeId is optional here (a plain query param) even though the
// service rejects a missing value with a plain Error — mirrors the
// original, where `wasteTypeId` also arrives as an optional `req.query`
// value and is checked for truthiness inside the handler, not enforced by
// the route/type layer.
export interface GetWasteCharacteristicsSummaryRequest {
  wasteTypeId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  healthcareFacilityId?: number;
}
export interface GetWasteCharacteristicsSummaryResponse {
  status: "success";
  data: WasteCharacteristicsSummaryData;
}

// ---- GET /api/v1/dashboard/summary-per-day ----
export interface GetSummaryPerDayRequest {}
export interface GetSummaryPerDayResponse {
  status: "success";
  data: SummaryPerDayData;
}
