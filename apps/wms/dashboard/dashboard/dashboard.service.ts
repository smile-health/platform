import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./dashboard.repository";
import { disposalTreatmentSchema, wasteCharacteristicsDateRangeSchema } from "./dashboard.schema";
import type {
  DashboardHealthcareRow,
  DashboardThirdPartyRow,
  PaginatedDashboardHealthcareRows,
  PaginatedDashboardThirdPartyRows,
  PaginatedWasteGroupDetailsByActionRows,
  PaginatedWasteHierarchyRows,
  SummaryPerDayData,
  WasteCharacteristicsSummaryData,
} from "./dashboard.types";

// dashboardController.ts's handlers wrap everything in a single try/catch
// that does:
//   if (error instanceof Error || typeof error === 'string') res.error(error);
//   else res.error(req.t('common.server-error'));
// There is no res.fail(...) anywhere in this controller EXCEPT
// getWasteGroupByTreatment's `if (!disposalTreatment) res.fail(...,
// {isValidationError:true})` branch — every other guard
// (`if (!provinceId) throw new Error(...)`, `!cityId`, `!wasteGroupId`,
// `!wasteTypeId`, and getWasteCharacteristicsSummary's repo-level
// `!startDate || !endDate` check) throws a plain, un-flagged `Error`, which
// under errorEnvelope always maps to a 500 "error" envelope. So every guard
// below throws a plain Error, matching byte-for-byte, EXCEPT
// getWasteGroupByTreatment's disposalTreatment check, which is the one
// case ported as APIError(InvalidArgument) (422).
//
// The manual Bearer-token re-check every original handler also performs
// (`if (!authHeader?.startsWith('Bearer ')) res.fail(missing-token,
// {isValidationError:true})`) is unreachable under Encore's `auth: true` —
// dropped, same call made throughout every other ported module.

function sanitizePagination(limit?: number, page?: number): { limit: number; page: number } {
  const maxLimit = 1000;
  const safeLimit = Number.isInteger(limit) && (limit as number) > 0 ? Math.min(limit as number, maxLimit) : 10;
  const safePage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : 1;
  return { limit: safeLimit, page: safePage };
}

export async function getSummaryWasteHierarchy(input: {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedWasteHierarchyRows> {
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const { data, total } = await repo.getSummaryWasteHierarchy(limit, page, input.startDate, input.endDate);
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getSummaryWasteHierarchyByProvince(input: {
  provinceId: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedWasteHierarchyRows> {
  // Original: `if (!provinceId) throw new Error('provinceId are required.')`.
  // provinceId is a required Encore path param here, so an empty segment is
  // already unroutable — this guard only catches a non-numeric segment,
  // matching the original's lack of a NaN check (Number('abc') -> NaN is
  // passed straight through to the query, same as upstream).
  if (!input.provinceId) {
    throw new Error("provinceId are required.");
  }
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const provinceId = Number(input.provinceId);
  const { data, total } = await repo.getSummaryWasteHierarchyByProvince(
    limit,
    page,
    provinceId,
    input.startDate,
    input.endDate,
  );
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getSummaryWasteHierarchyByCity(input: {
  cityId: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  healthcareFacilityId?: number;
}): Promise<PaginatedWasteHierarchyRows> {
  if (!input.cityId) {
    throw new Error("cityId are required.");
  }
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const cityId = Number(input.cityId);
  const { data, total } = await repo.getSummaryWasteHierarchyByCity(
    limit,
    page,
    cityId,
    input.startDate,
    input.endDate,
    input.healthcareFacilityId,
  );
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getWasteGroupByAdminHealthcareFacility(input: {
  limit?: number;
  page?: number;
  wasteTypeId?: number;
  healthcareFacilityId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  wasteStatus?: string;
  search?: string;
  // Resolved by the controller from getAuthData() — see that call site's
  // comment for why. Mirrors the original's
  // `entityId && entityType === 'healthcare_facility' && !isSuperAdmin` override.
  callerEntityId?: number;
  callerEntityTypeName?: string;
  callerIsSuperAdmin?: boolean;
}): Promise<PaginatedDashboardHealthcareRows> {
  const { limit, page } = sanitizePagination(input.limit, input.page);

  let resolvedHealthcareId = input.healthcareFacilityId;
  if (
    input.callerEntityId &&
    input.callerEntityTypeName === "healthcare_facility" &&
    !input.callerIsSuperAdmin
  ) {
    resolvedHealthcareId = input.callerEntityId;
  }

  const { data, total }: { data: DashboardHealthcareRow[]; total: number } =
    await repo.getWasteGroupByAdminHealthcareFacility(limit, page, {
      wasteTypeId: input.wasteTypeId,
      healthcareFacilityId: resolvedHealthcareId,
      wasteGroupId: input.wasteGroupId,
      wasteCharacteristicsId: input.wasteCharacteristicsId,
      wasteStatus: input.wasteStatus,
      search: input.search,
    });
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getWasteGroupByTransporter(input: {
  limit?: number;
  page?: number;
  healthcareFacilityId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  callerEntityId: number;
}): Promise<PaginatedDashboardThirdPartyRows> {
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const { data, total }: { data: DashboardThirdPartyRow[]; total: number } =
    await repo.getWasteGroupByTransporter(limit, page, input.callerEntityId, {
      healthcareFacilityId: input.healthcareFacilityId,
      provinceId: input.provinceId,
      cityId: input.cityId,
      startDate: input.startDate,
      endDate: input.endDate,
      search: input.search,
    });
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getWasteGroupByTreatment(input: {
  limit?: number;
  page?: number;
  disposalTreatment?: string;
  healthcareFacilityId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  callerEntityId: number;
}): Promise<PaginatedDashboardThirdPartyRows> {
  // The one reachable, flagged validation branch in this controller — ported
  // as APIError(InvalidArgument) (422), unlike every other guard here (see
  // this file's top comment).
  const parsed = disposalTreatmentSchema.safeParse({ disposalTreatment: input.disposalTreatment });
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "disposalTreatment required");
  }

  const { limit, page } = sanitizePagination(input.limit, input.page);
  const { data, total }: { data: DashboardThirdPartyRow[]; total: number } =
    await repo.getWasteGroupByTreatmentAll(limit, page, input.callerEntityId, parsed.data.disposalTreatment, {
      healthcareFacilityId: input.healthcareFacilityId,
      provinceId: input.provinceId,
      cityId: input.cityId,
      startDate: input.startDate,
      endDate: input.endDate,
      search: input.search,
    });
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getWasteGroupDetailsByAction(input: {
  wasteGroupId: string;
  limit?: number;
  page?: number;
  treatmentType?: string;
}): Promise<PaginatedWasteGroupDetailsByActionRows> {
  if (!input.wasteGroupId) {
    throw new Error("wasteGroupId are required.");
  }
  const { limit, page } = sanitizePagination(input.limit, input.page);
  const wasteGroupId = Number(input.wasteGroupId);
  // Original: `(treatmentType ?? 'EX').toString()` — defaults to 'EX' when absent.
  const treatmentType = input.treatmentType ?? "EX";
  const { data, total } = await repo.getWasteGroupDetailsByAction(limit, page, wasteGroupId, treatmentType);
  return { data, pagination: { total, pages: Math.ceil(total / limit), currentPage: page, perPage: limit } };
}

export async function getWasteCharacteristicsSummary(input: {
  wasteTypeId?: number;
  provinceId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  healthcareFacilityId?: number;
}): Promise<WasteCharacteristicsSummaryData> {
  // Original: `if (!wasteTypeId) throw new Error('wasteTypeId are required.')`
  // in the controller, before the use case/repo are even reached.
  if (!input.wasteTypeId) {
    throw new Error("wasteTypeId are required.");
  }
  // Original: DashboardRepositoryImpl.getWasteCharacteristicsSummary's own
  // `if (!startDate || !endDate) throw new Error(...)` guard, applied here
  // instead (a plain Error either way, so the port location doesn't change
  // behavior).
  const parsed = wasteCharacteristicsDateRangeSchema.safeParse({
    startDate: input.startDate,
    endDate: input.endDate,
  });
  if (!parsed.success) {
    throw new Error("startDate and endDate are required.");
  }

  const data = await repo.getWasteCharacteristicsSummary(
    input.wasteTypeId,
    parsed.data.startDate,
    parsed.data.endDate,
    input.provinceId,
    input.cityId,
    input.healthcareFacilityId,
  );
  return { data };
}

export async function getSummaryPerDay(entityId: number): Promise<SummaryPerDayData> {
  return repo.getSummaryPerDay(entityId);
}
