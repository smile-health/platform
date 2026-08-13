import { APIError, ErrCode } from "encore.dev/api";
import * as wasteBagService from "../waste-bag/waste-bag.service";
import * as wasteClassificationRepo from "../waste-classification/waste-classification.repository";
import * as wasteSourceRepo from "../waste-source/waste-source.repository";
import type { WasteBag } from "../waste-bag/waste-bag.types";
import type { WasteClassification } from "../waste-classification/waste-classification.types";
import type { WasteSource } from "../waste-source/waste-source.types";
import type {
  GetDataHomePageRequest,
  GetDetailDataHomePageRequest,
  HomepageTransactionItem,
  WasteClassificationLabels,
  WasteRecapItem,
  BFFWasteBagStorageDate,
} from "./mobile-homepage.types";

// ---------------------------------------------------------------------------
// Small pure helpers ported verbatim from apps/wms-service's
// shared/utils/formating.ts and shared/types/bffWasteStatus.ts. Duplicated
// locally (rather than pulled from a shared module) since this migration has
// no shared/utils directory yet in wms-encore and the brief for this pass is
// scoped to these new mobile directories only.

function formatTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getBFFWasteBagStorageDate(futureTimestamp?: Date): BFFWasteBagStorageDate | undefined {
  if (!futureTimestamp || Number.isNaN(new Date(futureTimestamp).getTime())) return undefined;
  const parsedFutureDate = new Date(futureTimestamp);
  const now = new Date();
  const msDiff = parsedFutureDate.getTime() - now.getTime();
  return {
    timestamp: parsedFutureDate.toISOString(),
    difference: {
      days: Math.floor(msDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((msDiff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((msDiff / (1000 * 60)) % 60),
      milliseconds: msDiff,
      isExpired: msDiff < 0,
    },
  };
}

// Mirrors shared/types/bffWasteStatus.ts's getBFFWasteStatusFromWMSWasteStatus.
const BFF_WASTE_STATUS_LABELS: Record<string, string> = {
  IN_TEMPORARY_STORAGE: "In Temporary Storage",
  IN_COLD_STORAGE: "In Cold Storage",
  INCINERATION_IN_PROCESS: "Incineration In Process",
  STERILIZATION_IN_PROCESS: "Sterilization In Process",
  INTERNAL_LANDFILL_IN_PROCESS: "Internal Landfill In Process",
  INTERNAL_LANDFILLED: "Internal Landfilled",
  INCINERATED: "Incinerated",
  STERILISED: "Sterilised",
  READY_FOR_TRANSPORT: "Ready For Transport",
  TRANSPORTATION_REQUEST_CREATED: "Transportation Request Created",
  IN_TRANSIT: "In Transit",
  READY_FOR_TREATMENT: "Ready For Treatment",
  IN_THIRD_PARTY_STORAGE: "In Third Party Storage",
  RECYCLED: "Recycled",
  LANDFILLED: "Landfilled",
  COLLECTED: "Collected",
  DISPOSED: "Disposed",
  HANDOVER_TO_TREATMENT: "Handover To Treatment",
};
function bffWasteStatus(status: string): string {
  return BFF_WASTE_STATUS_LABELS[status] ?? status;
}

// Mirrors shared/utils/formating.ts's getWasteSourceName.
function getWasteSourceName(wasteSource: WasteSource | null): string {
  switch (wasteSource?.sourceType) {
    case "EXTERNAL":
      return wasteSource.externalHealthcareFacilityName || "Unknown External Source";
    case "INTERNAL":
      return wasteSource.internalSourceName || "Unknown Internal Source";
    case "INTERNAL_TREATMENT":
      return wasteSource.internalTreatmentName || "Unknown Internal Treatment";
    default:
      return "Unknown Source";
  }
}

// Per-classification-id memoized lookup — a homepage page fetches at most
// `limit` (default 30) waste bags, typically sharing a small set of distinct
// classifications, so this avoids N duplicate DB round-trips.
async function loadClassifications(
  wasteBags: WasteBag[]
): Promise<Map<number, WasteClassification | null>> {
  const ids = Array.from(new Set(wasteBags.map((b) => b.wasteClassificationId)));
  const entries = await Promise.all(
    ids.map(async (id) => [id, await wasteClassificationRepo.findById(id)] as const)
  );
  return new Map(entries);
}

function toClassificationLabels(wc: WasteClassification | null): WasteClassificationLabels {
  return {
    wasteType: {
      id: String(wc?.wasteType?.id ?? wc?.wasteTypeId ?? ""),
      label: wc?.wasteType?.name ?? "",
      labelEn: wc?.wasteType?.nameEn ?? "",
    },
    wasteGroup: {
      id: String(wc?.wasteGroup?.id ?? wc?.wasteGroupId ?? ""),
      label: wc?.wasteGroup?.name ?? "",
      labelEn: wc?.wasteGroup?.nameEn ?? "",
    },
    wasteCharacteristic: {
      id: String(wc?.wasteCharacteristics?.id ?? wc?.wasteCharacteristicsId ?? ""),
      label: wc?.wasteCharacteristics?.name ?? "",
      labelEn: wc?.wasteCharacteristics?.nameEn ?? "",
    },
  };
}

function toTransactionItem(bag: WasteBag, wc: WasteClassification | null): HomepageTransactionItem {
  let weight = 0;
  if (bag.weightInKgs != null) {
    const parsed = Number(bag.weightInKgs);
    if (!Number.isNaN(parsed)) weight = parsed;
  }
  return {
    id: bag.wasteBagQrCodeId,
    date: bag.createdAt,
    classification: toClassificationLabels(wc),
    treatmentStatus: "", // unused — preserved verbatim from the original
    wasteStatus: bffWasteStatus(bag.wasteStatus),
    disposalMethod: wc?.disposalMethod,
    weight: { value: weight, unit: "kg" },
    storageEndDate: getBFFWasteBagStorageDate(bag.scheduledStorageEndDatetime),
  };
}

function parseWasteClassificationIds(raw?: string): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

export async function getDataHomePage(
  req: GetDataHomePageRequest,
  auth: { entityId: number; userID: string }
): Promise<{
  locationName?: string;
  user: { name?: string; languagePreference: "EN" };
  wasteRecap: WasteRecapItem[];
  transactions: { pagination: any; data: HomepageTransactionItem[] };
}> {
  const wasteStatus = req.wasteStatus ?? req.wasteTreatment?.toUpperCase();

  const [recap, wasteBagPage] = await Promise.all([
    wasteBagService.getWasteBagSummaryByCharacteristics({
      wasteUpdateStart: req.startDate,
      wasteUpdateEnd: req.endDate,
      healthcareId: auth.entityId,
    }),
    wasteBagService.getAllWasteBags({
      limit: req.limit && req.limit > 0 ? req.limit : 30,
      page: req.page && req.page > 0 ? req.page : 1,
      search: req.search,
      healthcareId: req.healthcareId ?? auth.entityId,
      transporterId: req.transporterId ?? auth.entityId,
      thirdPartyId: req.thirdPartyId ?? auth.entityId,
      wasteUpdateStart: req.wasteUpdateStart ?? req.startDate,
      wasteUpdateEnd: req.wasteUpdateEnd ?? req.endDate,
      wasteClassificationId: parseWasteClassificationIds(req.wasteClassificationId),
      transportationGroupId: req.transportationGroupId,
      transportationExternalGroupId: req.transportationExternalGroupId,
      treatmentGroupId: req.treatmentGroupId,
      treatmentExternalGroupId: req.treatmentExternalGroupId,
      ownedBy: req.ownedBy,
      wasteStatus,
      binNumber: req.binNumber,
      wasteBagQrCodeId: req.wasteBagQrCodeId,
      id: req.id,
      isTreated: req.isTreated,
      isDisposed: req.isDisposed,
    }),
  ]);

  const classifications = await loadClassifications(wasteBagPage.data);

  const wasteRecap: WasteRecapItem[] = (recap ?? []).map((item) => ({
    type: String(item.wasteCharacteristicsName ?? item.wasteCharacteristicsNameEn ?? ""),
    weight: parseFloat(String(item.totalWeightInKgs ?? "")) || 0,
    unit: "kg",
    transactionCount: item.totalWasteBag,
    manualWeight: parseFloat(String(item.manualWeightInKgs ?? "")) || 0,
    manualBagsCount: item.manualWasteBagCount,
    iotWeight: parseFloat(String(item.iotWeightInKgs ?? "")) || 0,
    iotBagsCount: item.iotWasteBagCount,
  }));

  const data = wasteBagPage.data
    .map((bag) => toTransactionItem(bag, classifications.get(bag.wasteClassificationId) ?? null))
    .sort((a, b) => Number(a.classification.wasteType.id) - Number(b.classification.wasteType.id));

  return {
    // locationName / user.name deferred — see mobile-homepage.types.ts header.
    user: { languagePreference: "EN" },
    wasteRecap,
    transactions: {
      pagination: {
        page: wasteBagPage.pagination.currentPage,
        limit: wasteBagPage.pagination.perPage,
        totalItems: wasteBagPage.pagination.total,
        totalPages: wasteBagPage.pagination.pages,
      },
      data,
    },
  };
}

export async function getDetailDataHomePage(
  req: GetDetailDataHomePageRequest,
  auth: { entityId: number }
) {
  const wasteBagPage = await wasteBagService.getAllWasteBags({
    limit: 1,
    page: 1,
    search: req.search,
    healthcareId: req.healthcareId,
    transporterId: req.transporterId,
    thirdPartyId: req.thirdPartyId,
    wasteUpdateStart: req.wasteUpdateStart,
    wasteUpdateEnd: req.wasteUpdateEnd,
    wasteClassificationId: parseWasteClassificationIds(req.wasteClassificationId),
    transportationGroupId: req.transportationGroupId,
    transportationExternalGroupId: req.transportationExternalGroupId,
    treatmentGroupId: req.treatmentGroupId,
    treatmentExternalGroupId: req.treatmentExternalGroupId,
    ownedBy: req.ownedBy,
    wasteStatus: req.wasteStatus,
    binNumber: req.binNumber,
    // Path param wins over the query-string wasteBagQrCodeId, mirroring the
    // original's `wasteId ? wasteId : wasteBagQrCodeId`.
    wasteBagQrCodeId: req.wasteId ?? req.wasteBagQrCodeId,
    id: req.id,
    isTreated: req.isTreated,
    isDisposed: req.isDisposed,
  });

  const firstBag = wasteBagPage.data[0];
  if (!firstBag) {
    // res.fail(t('waste.error.NOT_FOUND')) with no isValidationError flag ->
    // FailedPrecondition, same convention as every other plain res.fail
    // branch ported elsewhere in this codebase.
    throw new APIError(ErrCode.FailedPrecondition, "waste.error.NOT_FOUND");
  }

  const [wc, wasteSource] = await Promise.all([
    wasteClassificationRepo.findById(firstBag.wasteClassificationId),
    wasteSourceRepo.findById(firstBag.wasteSourceId),
  ]);

  let weightLabel = "Not Measured";
  if (firstBag.weightInKgs != null) {
    weightLabel = `${firstBag.weightInKgs} kgs`;
  }

  return {
    id: firstBag.wasteBagQrCodeId,
    date: firstBag.createdAt,
    classification: toClassificationLabels(wc),
    disposalMethod: wc?.disposalMethod,
    wasteSourceType: formatTitleCase(wasteSource?.sourceType ?? "Unknown"),
    wasteSourceName: getWasteSourceName(wasteSource),
    weight: weightLabel,
    scaleMethod: formatTitleCase(firstBag.scaleMethod),
    treatmentStatus: bffWasteStatus(firstBag.wasteStatus),
    // wasteHistory deferred — see mobile-homepage.types.ts header.
    wasteHistory: [] as unknown[],
    storageEndDate: getBFFWasteBagStorageDate(firstBag.scheduledStorageEndDatetime),
    // processWastebagEnd deferred — no equivalent field on the ported
    // WasteBag entity.
    processWastebagEnd: undefined,
  };
}
