import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-bag-record.repository";
import * as wasteClassificationRepo from "../waste-classification/waste-classification.repository";
import { createWasteBagRecordBodySchema } from "./waste-bag-record.schema";
import type { WasteBagRecord, WasteBagRecordDailySummary } from "./waste-bag-record.types";
import { getEntityId } from "../../entity/entities/entities.repository";
import { isValidDateString } from "../../shared/utils/date-range";
import { getEntityRegionNames } from "../../shared/core/entity-region-lookup";
import * as wasteBagTreatmentGroupRepo from "../waste-bag-treatment-group/waste-bag-treatment-group.repository";

// wasteRecordController.ts's res.fail(...)/res.error(...) calls, verbatim:
//  - createWasteRecordController: missing bearer token -> res.fail(...,
//    {isValidationError:true}) -> 422 (InvalidArgument). The use case's
//    string-return branches (e.g. 'MISSING_FIELD', 'WASTE_CLASSIFICATION_NOT_FOUND')
//    -> res.fail(t(`waste.error.${code}`), {message:...}) -> no isXError flag
//    given -> plain 400 (FailedPrecondition), preserved as such below.
//  - getAllWasteRecordController / getWasteRecordCharacteristicsSummaryExportExcel:
//    all res.error(...) calls in the catch block are unconditional 500s (thrown
//    as plain Error from the use case) -> mapped to APIError with
//    ErrCode.Internal below, not FailedPrecondition (this module's catch-all
//    errors were always genuine "something broke" cases, unlike other ported
//    modules' res.fail(...) 400s).

export async function createWasteBagRecord(input: {
  createdBy: string;
  healthcareFacilityId: number;
  wasteSourceId: number;
  wasteClassificationId: number;
  scaleMethod: string;
  weightInKgs: number;
  sourceTreatmentGroupId?: string;
  wasteBagQrCodeId: string;
  binNumber?: string;
  iotMethod?: string;
  wasteGroupIds?: string;
  isTreated?: boolean;
  bastNo?: string;
  materialIds?: string;
  assetId?: number;
}): Promise<WasteBagRecord> {
  const parsed = createWasteBagRecordBodySchema.safeParse(input);
  if (!parsed.success) {
    // Original: createWasteSchema (Zod) validated by validateRequest
    // middleware ahead of the controller -> a validation failure there
    // responds before ever reaching the controller/use-case. Encore has no
    // separate middleware layer here, so this mirrors it as a 422.
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const wasteClassification = await wasteClassificationRepo.findById(input.wasteClassificationId);
  if (!wasteClassification) {
    // Original use-case returns the string 'WASTE_CLASSIFICATION_NOT_FOUND',
    // rendered by the controller as res.fail(t('waste.error.WASTE_CLASSIFICATION_NOT_FOUND'),
    // {message:...}) with no isXError flag -> plain 400.
    throw new APIError(ErrCode.FailedPrecondition, "WASTE_CLASSIFICATION_NOT_FOUND");
  }

  const startDate = new Date();
  const scheduledStorageEndDatetime = new Date(
    startDate.getTime() + Number(wasteClassification.tempStorageMaxHours ?? 0) * 60 * 60 * 1000
  );

  // Mirrors WasteBagRecordRepositoryImpl.createWasteBagRecord's
  // getEntityDetail(healthcareFacilityId, token) enrichment — from the local
  // `entities`/`regions` tables rather than the HTTP round-trip (same
  // pattern as waste-bag.service.ts's createWasteBag).
  const entity = await getEntityId(input.healthcareFacilityId);
  const regionNames = await getEntityRegionNames(entity);

  const created = await repo.create({
    createdBy: input.createdBy,
    healthcareFacilityId: input.healthcareFacilityId,
    wasteBagQrCodeId: parsed.data.wasteBagQrCodeId,
    wasteSourceId: parsed.data.wasteSourceId,
    sourceTreatmentGroupId: parsed.data.sourceTreatmentGroupId,
    wasteClassificationId: parsed.data.wasteClassificationId,
    scheduledStorageEndDatetime,
    assetId: input.assetId,
    scaleMethod: parsed.data.scaleMethod,
    weightInKgs: parsed.data.weightInKgs,
    ownedBy: "HEALTHCARE_FACILITY",
    isTreated: parsed.data.isTreated ?? false,
    isDisposed: false,
    binNumber: parsed.data.binNumber,
    iotMethod: parsed.data.iotMethod,
    wasteGroupIds: parsed.data.wasteGroupIds,
    bastNo: parsed.data.bastNo,
    materialIds: parsed.data.materialIds,
    healthcareFacilityName: entity?.name,
    ...regionNames,
  });

  // Original: after create, if wasteGroupIds is set, flips a readonly flag
  // on the referenced waste-bag-treatment-group rows.
  if (parsed.data.wasteGroupIds) {
    await wasteBagTreatmentGroupRepo.updateIsReadOnly(parsed.data.wasteGroupIds);
  }

  return created;
}

export async function getAllWasteBagRecord(input: {
  limit?: number;
  page?: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: string;
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  sourceType?: string;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteCharacteristicsId?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
  entityTag?: string;
  entityId?: number;
}): Promise<WasteBagRecordDailySummary[]> {
  // Original: `if (!entityTag) throw new Error('Authorization error');` inside
  // the repository impl's try/catch, re-thrown as `Database error: ...` and
  // surfaced by the controller's res.error(...) -> unconditional 500.
  if (!input.entityTag) {
    throw new APIError(ErrCode.Internal, "Authorization error");
  }

  let wasteClassificationIds: number[] = [];
  if (input.wasteClassificationId) {
    try {
      wasteClassificationIds = JSON.parse(input.wasteClassificationId) as number[];
    } catch {
      // Original: JSON.parse(...) with no try/catch around it — a malformed
      // value would throw synchronously inside the controller (uncaught by
      // its own try/catch since it happens before useCase.execute is called,
      // producing an unhandled rejection in Express). Ported here as an
      // explicit 400 instead of letting it crash.
      throw new APIError(ErrCode.FailedPrecondition, "wasteClassificationId must be valid JSON");
    }
  }

  // Mirrors WasteBagRecordRepositoryImpl.getAllWasteBagRecord's joins against
  // waste_source/waste_classification/waste_hierarchy (x3 aliases) to enrich
  // each row with wasteType/wasteGroup/wasteCharacteristics names before
  // grouping by date. wasteType/wasteGroup/wasteCharacteristics still fall
  // back to 'Unknown' below when the joined hierarchy row's name is
  // null/missing, matching the original's own
  // `r.wasteClassification?.wasteType?.name || 'Unknown'` fallback.
  const rows = await repo.findAllFilteredWithClassification({
    entityTag: input.entityTag,
    entityId: input.entityId,
    search: input.search,
    wasteClassificationId: wasteClassificationIds,
    wasteUpdateStart: input.wasteUpdateStart,
    wasteUpdateEnd: input.wasteUpdateEnd,
    transportationGroupId: input.transportationGroupId,
    transportationExternalGroupId: input.transportationExternalGroupId,
    treatmentGroupId: input.treatmentGroupId,
    treatmentExternalGroupId: input.treatmentExternalGroupId,
    ownedBy: input.ownedBy,
    wasteStatus: input.wasteStatus,
    isTreated: input.isTreated,
    isDisposed: input.isDisposed,
    binNumber: input.binNumber,
    wasteBagQrCodeId: input.wasteBagQrCodeId,
    id: input.id,
    sourceType: input.sourceType,
    wasteTypeId: input.wasteTypeId,
    wasteGroupId: input.wasteGroupId,
    wasteCharacteristicsId: input.wasteCharacteristicsId,
  });

  const groupedByDate: Record<string, WasteBagRecordDailySummary> = {};
  for (const r of rows) {
    const dateValue = r.createdAt ?? r.updatedAt;
    let date = "Unknown";
    if (dateValue && !Number.isNaN(new Date(dateValue).getTime())) {
      date = new Date(dateValue).toISOString().split("T")[0];
    }

    if (!groupedByDate[date]) {
      groupedByDate[date] = { date, totalBags: 0, totalWeight: 0, listWasteBags: [] };
    }

    const weight = Number(r.weightInKgs ?? 0);
    groupedByDate[date].totalWeight += weight;
    groupedByDate[date].listWasteBags.push({
      wasteBagQrCode: r.wasteBagQrCodeId ?? "-",
      weightInKgs: weight,
      wasteType: r.wasteTypeName || "Unknown",
      date: r.createdAt,
      wasteGroup: r.wasteGroupName || "Unknown",
      wasteCharacteristics: r.wasteCharacteristicsName || "Unknown",
    });
    groupedByDate[date].totalBags += 1;
  }

  return Object.values(groupedByDate);
}

function tsForFilename(tz = "Asia/Jakarta"): string {
  const d = new Date();
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
}

export function safeFilenamePart(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 100);
}

export function buildContentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
  const rfc5987 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}

// Mirrors getWasteRecordCharacteristicsSummaryExportExcel's `if (!startDate ||
// !endDate) throw new Error('startDate and endDate are required.')` guard
// (a plain Error -> the controller's unconditional res.error(...) -> 500,
// same as this file's other top comment notes for this module).
export async function exportWasteRecordCharacteristicsSummary(filters: {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
}): Promise<{ buffer: Buffer; filename: string }> {
  if (!isValidDateString(filters.startDate) || !isValidDateString(filters.endDate)) {
    throw new Error("startDate and endDate are required.");
  }
  const { startDate, endDate } = filters;

  // Loaded lazily, same reasoning as dashboard-activity.service.ts's
  // exportActivitySummariesForEntities — only pull in exceljs's writer
  // machinery when an export is actually requested.
  const ExcelJS = (await import("exceljs")).default;

  const rows = await repo.findRecordCharacteristicsSummary({
    startDate,
    endDate,
    provinceId: filters.provinceId,
    regencyId: filters.regencyId,
    healthcareFacilityId: filters.healthcareFacilityId,
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = "WMS";
  wb.created = new Date();
  const ws = wb.addWorksheet("WasteRecordSummary");

  ws.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "wasteTypeName", header: "Jenis", width: 22 },
    { key: "wasteGroupName", header: "Kelompok", width: 16 },
    { key: "wasteCharacteristicsName", header: "Karakteristik", width: 20 },
    { key: "totalWeightInKgs", header: "Total Berat (Kg)", width: 18 },
    { key: "avgWeightPerDay", header: "Rata-rata berat per hari", width: 18 },
    { key: "totalWasteBag", header: "Jumlah kantong", width: 15 },
    {
      key: "avgWasteBagPerDay",
      header: "Jumlah Rata-rata kantong per hari (Kantong)",
      width: 18,
    },
  ];
  ws.getRow(1).font = { bold: true };

  rows.forEach((r, idx) => {
    ws.addRow({
      no: idx + 1,
      wasteTypeName: r.wasteTypeName,
      wasteGroupName: r.wasteGroupName,
      wasteCharacteristicsName: r.wasteCharacteristicsName,
      totalWeightInKgs: r.totalWeightInKgs,
      avgWeightPerDay: r.avgWeightPerDay,
      totalWasteBag: r.totalWasteBag,
      avgWasteBagPerDay: r.avgWasteBagPerDay,
    });
  });

  // Original also merges/centers a title row above the header, applies thin
  // borders to every data cell, and auto-fits column widths dynamically
  // (mergeAndCenter/borderThin helpers in
  // WasteTrackingExportExcelRepositoryImpl.getWasteRecordCharacteristicsSummaryForExport).
  // Skipped here — cosmetic-only, doesn't affect the data contract — but
  // flagged for a later polish pass.

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `waste_characteristics_${safeFilenamePart(startDate)}_${safeFilenamePart(endDate)}_${tsForFilename("Asia/Jakarta")}.xlsx`;
  return { buffer: Buffer.from(buffer as ArrayBuffer), filename };
}
