// Mirrors apps/wms-service's application/use-cases/wastebag-monitoring-dashboard/*
// use-cases. Every one of them is a thin try/catch pass-through to the
// repository with no input validation whatsoever (no isValidationError /
// isNotFoundError / any res.fail(...) flag anywhere in this module's
// original controller or use-cases — every branch that isn't a normal
// success is an unflagged `throw new Error(...)`, uncaught by the use-case's
// own try/catch since it's re-thrown as a plain Error). Per gotcha #3, that
// means this module has no APIError/ErrCode usage at all: a thrown error
// here propagates as a plain Error, which Encore surfaces as a 500 —
// exactly matching the original's `res.error(error)` fallback path.
import * as repo from "./wastebag-monitoring-dashboard.repository";
import type {
  EntityWasteBagSummaryByCharacteristicsRow,
  EntityWasteBagSummaryByGroupRow,
  EntityWasteBagSummaryRow,
  GetEntityWasteBagSummaryByCharacteristicsData,
  GetEntityWasteBagSummaryByGroupData,
  GetEntityWasteBagSummaryChartData,
  GetWasteGroupSummaryChartData,
  LabelValueRow,
  WasteBagSummaryQueryInput,
  WasteGroupSummaryRow,
} from "./wastebag-monitoring-dashboard.types";

// Mirrors paginationUtils.sanitizePaginationParams({ maxLimit: 200 }) used by
// every entity-* endpoint in the original repository.
function sanitizePagination(limit?: number, page?: number, maxLimit = 200) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), maxLimit);
  const safePage = Math.max(Number(page) || 1, 1);
  return { limit: safeLimit, page: safePage };
}

function toFilters(input: WasteBagSummaryQueryInput) {
  return {
    startDate: input.startDate,
    endDate: input.endDate,
    provinceId: input.provinceId,
    regencyId: input.regencyId,
    healthcareFacilityId: input.healthcareFacilityId,
    entityTag: input.entityTag,
    wasteTypeId: input.wasteTypeId,
    wasteGroupId: input.wasteGroupId,
    wasteCharacteristicsId: input.wasteCharacteristicsId,
  };
}

export async function getWasteGroupSummaryChart(
  input: WasteBagSummaryQueryInput,
): Promise<GetWasteGroupSummaryChartData> {
  const rows = await repo.getWasteGroupSummaryChart(toFilters(input));
  const isBags = input.isBags;
  const data: WasteGroupSummaryRow[] = rows.map((r) => ({
    labelType: input.lang === "en" ? r.wasteTypeNameEn : r.wasteTypeName,
    label: input.lang === "en" ? r.wasteGroupNameEn : r.wasteGroupName,
    value: isBags ? r.totalBags : r.totalWeight,
  }));
  const total = data.reduce((sum, r) => sum + r.value, 0);
  return { total, data };
}

export async function getWasteCharacteristicsSummaryChart(
  input: WasteBagSummaryQueryInput,
): Promise<LabelValueRow[]> {
  const rows = await repo.getWasteCharacteristicsSummaryChart(toFilters(input), input.isBags);
  return rows.map((r) => ({
    label: input.lang === "en" ? r.wasteTypeNameEn : r.wasteTypeName,
    value: input.isBags ? r.totalBags : r.totalWeight,
  }));
}

export async function getMonthlyWasteBagSummaryChart(
  input: WasteBagSummaryQueryInput,
): Promise<LabelValueRow[]> {
  const rows = await repo.getMonthlyWasteBagSummaryChart(toFilters(input));
  return rows.map((r) => ({
    label: r.labelMonth,
    value: input.isBags ? r.totalBags : r.totalWeight,
  }));
}

export async function getProvinceWasteBagSummaryChart(
  input: WasteBagSummaryQueryInput,
): Promise<LabelValueRow[]> {
  const rows = await repo.getProvinceWasteBagSummaryChart(
    toFilters(input),
    input.isBags,
    input.orderBy,
  );
  return rows.map((r) => ({
    label: r.provinceName,
    value: input.isBags ? r.totalBags : r.totalWeight,
  }));
}

export async function getRegencyWasteBagSummaryChart(
  input: WasteBagSummaryQueryInput,
): Promise<LabelValueRow[]> {
  const rows = await repo.getRegencyWasteBagSummaryChart(
    toFilters(input),
    input.isBags,
    input.orderBy,
  );
  return rows.map((r) => ({
    label: r.regencyName,
    value: input.isBags ? r.totalBags : r.totalWeight,
  }));
}

export async function getEntityWasteBagSummaryChart(
  input: WasteBagSummaryQueryInput,
): Promise<GetEntityWasteBagSummaryChartData> {
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const { data: rows, total } = await repo.getEntityWasteBagSummaryChart(
    toFilters(input),
    limit,
    page,
    input.orderBy,
  );
  const data: EntityWasteBagSummaryRow[] = rows.map((r) => ({
    provinceName: r.provinceName,
    regencyName: r.regencyName,
    healthcareFacilityName: r.healthcareFacilityName,
    value: input.isBags ? r.totalBags : r.totalWeight,
  }));
  return {
    data,
    pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit },
  };
}

export async function getEntityWasteBagSummaryByGroup(
  input: WasteBagSummaryQueryInput,
): Promise<GetEntityWasteBagSummaryByGroupData> {
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const { data: rows, total } = await repo.getEntityWasteBagSummaryByGroup(
    toFilters(input),
    limit,
    page,
    input.orderBy,
  );
  const data: EntityWasteBagSummaryByGroupRow[] = rows.map((r) => ({
    provinceName: r.provinceName,
    regencyName: r.regencyName,
    healthcareFacilityName: r.healthcareFacilityName,
    wasteGroupName: input.lang === "en" ? r.wasteGroupNameEn : r.wasteGroupName,
    value: input.isBags ? r.totalBags : r.totalWeight,
  }));
  return {
    data,
    pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit },
  };
}

export async function getEntityWasteBagSummaryByCharacteristics(
  input: WasteBagSummaryQueryInput,
): Promise<GetEntityWasteBagSummaryByCharacteristicsData> {
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const { data: rows, total } = await repo.getEntityWasteBagSummaryByCharacteristics(
    toFilters(input),
    limit,
    page,
  );
  const data: EntityWasteBagSummaryByCharacteristicsRow[] = rows.map((r) => ({
    provinceName: r.provinceName ?? undefined,
    regencyName: r.regencyName ?? undefined,
    healthcareFacilityName: r.healthcareFacilityName,
    wasteFullName: input.lang === "en" ? r.wasteFullNameEn : r.wasteFullName,
    value: input.isBags ? Number(r.totalBagsCurrentMonth) || 0 : Number(r.totalWeightCurrentMonth) || 0,
    avgValue: input.isBags ? Number(r.avgBagsPrev3Months) || 0 : Number(r.avgWeightPrev3Months) || 0,
    maxValue: input.isBags ? Number(r.maxBagsPrev3Months) || 0 : Number(r.maxWeightPrev3Months) || 0,
    gapValue: input.isBags ? Number(r.gapTimbulanBags) || 0 : Number(r.gapTimbulanWeight) || 0,
  }));
  return {
    data,
    pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit },
  };
}

// Used by the export raw endpoint — returns the same rows as
// getEntityWasteBagSummaryByCharacteristics (unpaginated: the original's
// export use-case has its own limit/page defaults of 99999/1, i.e.
// effectively "all rows", reproduced via a very high default limit passed
// by the controller) so the controller can build the xlsx workbook.
export async function getEntityWasteBagSummaryByCharacteristicsForExport(
  input: WasteBagSummaryQueryInput,
): Promise<EntityWasteBagSummaryByCharacteristicsRow[]> {
  const limit = Number.isFinite(Number(input.limit)) && input.limit ? Number(input.limit) : 99999;
  const page = Number.isFinite(Number(input.page)) && input.page ? Number(input.page) : 1;
  const rows = await repo.getEntityWasteBagSummaryByCharacteristicsExport(
    toFilters(input),
    limit,
    page,
  );
  return rows.map((r) => ({
    provinceName: r.provinceName ?? undefined,
    regencyName: r.regencyName ?? undefined,
    healthcareFacilityName: r.healthcareFacilityName,
    wasteFullName: input.lang === "en" ? r.wasteFullNameEn : r.wasteFullName,
    value: input.isBags ? Number(r.totalBagsCurrentMonth) || 0 : Number(r.totalWeightCurrentMonth) || 0,
    avgValue: input.isBags ? Number(r.avgBagsPrev3Months) || 0 : Number(r.avgWeightPrev3Months) || 0,
    maxValue: input.isBags ? Number(r.maxBagsPrev3Months) || 0 : Number(r.maxWeightPrev3Months) || 0,
    gapValue: input.isBags ? Number(r.gapTimbulanBags) || 0 : Number(r.gapTimbulanWeight) || 0,
  }));
}
