import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./waste-bag.repository";
import { isValidDateString } from "../../shared/utils/date-range";
import { bulkWasteBagQrCodeSchema } from "./waste-bag.schema";
import type { WasteBag, PaginatedWasteBags, BulkActionResult, GetAllTransactionWasteBagsRequest } from "./waste-bag.types";

// All status-changing lifecycle actions (create, temporary-store, cold-store,
// treatment, transport/treatment handover & follow-up, and the scheduled
// two-phase confirmations) live in ./usecases/<action>.ts — each imports the
// shared waste-bag machine and its own dependencies directly. This file is
// the read/reporting surface only: single/paginated lookups and the report
// exports, none of which mutate waste_status. See waste-bag.controller.ts /
// external callers for why every usecase function is re-exported below
// instead of being imported directly — they all do `import * as service
// from "./waste-bag.service"` and call `service.actionName(...)`, so the
// physical file an action lives in has to stay invisible to them.
export * from "./usecases/create";
export * from "./usecases/temporary-store";
export * from "./usecases/cold-store";
export * from "./usecases/treat-waste";
export * from "./usecases/follow-up-transport";
export * from "./usecases/handover-transport";
export * from "./usecases/pickup-transport-external";
export * from "./usecases/handover-treatment-external";
export * from "./usecases/receiving-treatment-external";
export * from "./usecases/advance-scheduled-event";

// ---------------------------------------------------------------------------
// getAllWasteController — res.fail is never called here (only res.error on
// unexpected exceptions, which Encore's framework-level error handling
// already covers) — no APIError branches to mirror.
export async function getAllWasteBags(input: {
  limit?: number;
  page?: number;
  search?: string;
  healthcareId?: number;
  transporterId?: number;
  thirdPartyId?: number;
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  wasteClassificationId?: number[];
  transportationGroupId?: number;
  transportationExternalGroupId?: number;
  treatmentGroupId?: number;
  treatmentExternalGroupId?: number;
  ownedBy?: string;
  wasteStatus?: string;
  binNumber?: string;
  wasteBagQrCodeId?: string;
  id?: number;
  isTreated?: boolean;
  isDisposed?: boolean;
}): Promise<PaginatedWasteBags> {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findPaginated({ ...input, limit: safeLimit, page: safePage });
}

export async function getWasteBagById(id: string): Promise<WasteBag> {
  const numericId = Number(id);
  if (!id || Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const data = await repo.findById(numericId);
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "WasteBag not found");
  }
  return data;
}


// followUpTreatmentListController — validates `wasteBagQrCodeIds` and
// resolves which bags qualify. ListFollowUpTreatmentUseCase itself does not
// change waste_status in the original (only temporaryStoreWasteBags does) —
// this performs no status change / no publish, so it isn't machine-gated.
export async function followUpTreatmentList(input: {
  wasteBagQrCodeIds: string[];
  updatedBy: string;
}): Promise<BulkActionResult> {
  const parsed = bulkWasteBagQrCodeSchema.safeParse(input);
  if (!parsed.success) {
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const bags = await repo.findManyByQrCodeIds(parsed.data.wasteBagQrCodeIds);
  return { affected: bags.length };
}


// ---- Reporting pass-throughs (reportWasteBagController.ts) ----------------

export async function getAllTransactionWasteBags(input: GetAllTransactionWasteBagsRequest) {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findTransactionsPaginated({ ...input, limit: safeLimit, page: safePage });
}

export async function getWasteBagSummaryByCharacteristics(input: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}) {
  return repo.findSummaryByCharacteristics(input);
}

export async function getWasteSourceSummary(input: {
  wasteUpdateStart?: string;
  wasteUpdateEnd?: string;
  healthcareId?: number;
}) {
  return repo.findWasteSourceSummary(input);
}

export async function getWasteBagLogBook(input: { limit?: number; page?: number; healthcareId?: number }) {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findLogBookPaginated({ limit: safeLimit, page: safePage, healthcareId: input.healthcareId });
}

export async function getWasteBagHistory(input: { id?: number; limit?: number; page?: number }) {
  const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
  const safePage = input.page && input.page > 0 ? input.page : 1;
  return repo.findHistory({ id: input.id, limit: safeLimit, page: safePage });
}

export async function getWasteGroupDetails(wasteGroupId: string) {
  if (!wasteGroupId) {
    throw new APIError(ErrCode.FailedPrecondition, "wasteGroupId parameter is required");
  }
  const data = await repo.findWasteGroupDetails(wasteGroupId);
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste group not found");
  }
  return data;
}

export async function getWasteBagInternalTreatmentDetails(wasteBagQrCodeId: string) {
  if (!wasteBagQrCodeId) {
    throw new APIError(ErrCode.FailedPrecondition, "wasteBagQrCodeId parameter is required");
  }
  const data = await repo.findInternalTreatmentDetails(wasteBagQrCodeId);
  if (!data) {
    throw new APIError(ErrCode.FailedPrecondition, "Waste bag not found");
  }
  return data;
}

// ---------------------------------------------------------------------------
// GET /api/v1/waste/waste-tracking-all/export
//
// Ports WasteTrackingAllExportExcelUseCase.execute + WasteTrackingExportExcel
// RepositoryImpl.exportWasteTrackingAllSheetsExcel (apps/wms-service, lines
// ~1193-1523): a 3-sheet workbook —
//   1. "Ringkasan Karakteristik Limbah" (per-characteristic totals/averages)
//   2. "Ringkasan per Sumber Limbah"    (per-source totals)
//   3. "Timbulan per Kantong Limbah"    (per-bag detail)
// — gated by checkAllSheetWasteTrackingAll(role, type): admin-only callers
// (role === 'admin', i.e. isOnlyAdmin in shared/utils/role.ts) get ONLY
// sheet 1 unless `type` (the caller's numeric entity.type, defaulted to 1 by
// the original when absent) equals 3; every other caller gets all 3 sheets.
//
// GAP: the original derives `type` from req.user?.entity?.type — a numeric
// entity-type id that AuthData (shared/auth/authHandler.ts) doesn't carry in
// this port (AuthData only has entityTypeName, a string). `type` is left at
// its original default of 1 here, so the `type !== 3` branch of the gate
// always holds for admin-role callers — i.e. admin-role callers always get
// the single-sheet form, same as most real traffic under the original's
// default. Flagged rather than silently dropped; revisit if entity.type
// needs to flow through AuthData for real.
//
// Cosmetic parity gap (same tradeoff already taken by
// exportWasteRecordCharacteristicsSummary above): the original's 3-line
// merged title block, thin cell borders, and B-column facility-name row
// merges are NOT reproduced — they're presentation-only and don't affect
// the data contract. The SUM formula total row IS reproduced per sheet,
// since that's a data-facing feature (matches the original's totals row).
export async function exportWasteTrackingAll(filters: {
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  role?: string;
  type?: number;
}): Promise<{ buffer: Buffer; filename: string }> {
  // Mirrors getWasteTrackingAllExportExcel's `if (!startDate || !endDate)
  // throw new Error(...)` guard — a plain Error, surfaced by the original's
  // catch-all as an unconditional 500. Extended to a real validity check
  // (not just truthy): the frontend's date-range picker sends the literal
  // placeholder string "-" for "nothing selected", which is truthy but not
  // a parseable date — Postgres rejects it outright (unlike MySQL, which
  // silently tolerated bad date literals), so this must reject it here
  // instead of letting it reach the query layer.
  if (!isValidDateString(filters.startDate) || !isValidDateString(filters.endDate)) {
    throw new APIError(ErrCode.Internal, "startDate and endDate are required.");
  }
  const { startDate, endDate } = filters;
  const role = filters.role ?? "admin";
  const type = filters.type ?? 1;

  // isOnlyAdmin(role) — shared/utils/role.ts's `role === 'admin'` check,
  // inlined here since no shared role-util module has been ported into
  // wms-encore yet (same gap as elsewhere in this codebase).
  const isOnlyAdminRole = role === "admin";
  const isAllTable = !(isOnlyAdminRole && type !== 3);

  const exportFilters = {
    startDate,
    endDate,
    provinceId: filters.provinceId,
    regencyId: filters.regencyId,
    healthcareFacilityId: filters.healthcareFacilityId,
  };

  const [characteristics, sources, bags] = await Promise.all([
    repo.findWasteTrackingCharacteristicsSummaryForExport(exportFilters),
    isAllTable ? repo.findWasteTrackingSourceSummaryForExport(exportFilters) : Promise.resolve([]),
    isAllTable ? repo.findWasteTrackingBagsForExport(exportFilters) : Promise.resolve([]),
  ]);

  // Loaded lazily, same reasoning as exportWasteRecordCharacteristicsSummary
  // above and dashboard-activity.service.ts's analogous export — only pull
  // in exceljs's writer machinery when an export is actually requested.
  const ExcelJS = (await import("exceljs")).default;

  const wb = new ExcelJS.Workbook();
  wb.creator = "WMS";
  wb.created = new Date();

  // ---------------- Sheet 1: Ringkasan Karakteristik Limbah ----------------
  const ws1 = wb.addWorksheet("Ringkasan Karakteristik Limbah");
  ws1.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "healthcareFacilityName", header: "Fasyankes", width: 25 },
    { key: "wasteTypeName", header: "Jenis", width: 22 },
    { key: "wasteGroupName", header: "Kelompok", width: 16 },
    { key: "wasteCharacteristicsName", header: "Karakteristik", width: 20 },
    { key: "wasteStatus", header: "Tindak Lanjut", width: 20 },
    { key: "totalWeightInKgs", header: "Total Berat (Kg)", width: 18 },
    { key: "avgWeightPerDay", header: "Rata-rata berat per hari", width: 18 },
    { key: "totalWasteBag", header: "Jumlah kantong", width: 15 },
    { key: "avgWasteBagPerDay", header: "Jumlah Rata-rata kantong per hari (Kantong)", width: 22 },
  ];
  ws1.getRow(1).font = { bold: true };

  characteristics.forEach((item, idx) => {
    ws1.addRow({
      no: idx + 1,
      healthcareFacilityName: item.healthcareFacilityName,
      wasteTypeName: item.wasteTypeName,
      wasteGroupName: item.wasteGroupName,
      wasteCharacteristicsName: item.wasteCharacteristicsName,
      wasteStatus: WASTE_STATUS[item.wasteStatus as string] ?? item.wasteStatus,
      totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
      avgWeightPerDay: Number(item.avgWeightPerDay) || 0,
      totalWasteBag: Number(item.totalWasteBag) || 0,
      avgWasteBagPerDay: Number(item.avgWasteBagPerDay) || 0,
    });
  });
  addTotalRow(ws1, characteristics.length, ["totalWeightInKgs", "avgWeightPerDay", "totalWasteBag", "avgWasteBagPerDay"], 2);

  if (!isAllTable) {
    const buffer = await wb.xlsx.writeBuffer();
    return { buffer: Buffer.from(buffer as ArrayBuffer), filename: exportFilename(startDate, endDate) };
  }

  // ---------------- Sheet 2: Ringkasan per Sumber Limbah ----------------
  const ws2 = wb.addWorksheet("Ringkasan per Sumber Limbah");
  ws2.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "sourceType", header: "Tipe Sumber Limbah", width: 22 },
    { key: "wasteSourceName", header: "Nama Sumber Limbah", width: 30 },
    { key: "totalWasteBag", header: "Total Kantong Limbah", width: 15 },
    { key: "totalWeightInKgs", header: "Total Berat (Kg)", width: 18 },
  ];
  ws2.getRow(1).font = { bold: true };

  sources.forEach((item, idx) => {
    ws2.addRow({
      no: idx + 1,
      sourceType: item.sourceType,
      wasteSourceName: item.wasteSourceName,
      totalWasteBag: Number(item.totalWasteBag) || 0,
      totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
    });
  });
  addTotalRow(ws2, sources.length, ["totalWasteBag", "totalWeightInKgs"], 1);

  // ---------------- Sheet 3: Timbulan per Kantong Limbah ----------------
  const ws3 = wb.addWorksheet("Timbulan per Kantong Limbah");
  ws3.columns = [
    { key: "no", header: "No", width: 5 },
    { key: "qrCode", header: "Kode Kantong Limbah", width: 22 },
    { key: "wasteCode", header: "Kode Limbah", width: 16 },
    { key: "wasteTypeName", header: "Jenis Limbah", width: 22 },
    { key: "wasteGroupName", header: "Kelompok Limbah", width: 22 },
    { key: "wasteCharacteristicsName", header: "Karakteristik Limbah", width: 24 },
    { key: "wasteSource", header: "Sumber Limbah", width: 28 },
    { key: "transporterName", header: "Pengangkut", width: 22 },
    { key: "thirdPartyName", header: "Pengolah Limbah", width: 22 },
    { key: "checkInDate", header: "Tanggal Masuk", width: 20 },
    { key: "storageMax", header: "Maksimal Penyimpanan (Hari)", width: 22 },
    { key: "weightInKgs", header: "Berat Masuk (Kg)", width: 16 },
    { key: "firstName", header: "Nama Operator", width: 22 },
    { key: "wasteStatus", header: "Status", width: 16 },
  ];
  ws3.getRow(1).font = { bold: true };

  bags.forEach((item, idx) => {
    ws3.addRow({
      no: idx + 1,
      qrCode: item.qrCode,
      wasteCode: item.wasteCode || "-",
      wasteTypeName: item.wasteTypeName,
      wasteGroupName: item.wasteGroupName,
      wasteCharacteristicsName: item.wasteCharacteristicsName,
      wasteSource: item.wasteSource,
      transporterName: item.transporterName || "-",
      thirdPartyName: item.thirdPartyName || "-",
      checkInDate: item.checkInDate ? new Date(item.checkInDate as string) : null,
      storageMax: item.storageMax != null ? Number(item.storageMax) : "-",
      weightInKgs: Number(item.weightInKgs) || 0,
      firstName: item.firstName || "-",
      wasteStatus: WASTE_STATUS[item.wasteStatus as string] ?? item.wasteStatus,
    });
  });
  addTotalRow(ws3, bags.length, ["weightInKgs"], 1);

  const buffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer as ArrayBuffer), filename: exportFilename(startDate, endDate) };
}

// WASTE_STATUS label map — mirrors shared/utils/dictionary.ts's WASTE_STATUS
// (Indonesian labels), used by the original's export to render waste_status
// for both the characteristics summary and per-bag detail sheets.
const WASTE_STATUS: Record<string, string> = {
  IN_TEMPORARY_STORAGE: "Tersimpan",
  IN_COLD_STORAGE: "Penyimpanan Dingin",
  INTERNAL_LANDFILLED: "Ditimbus Internal",
  INCINERATED: "Diolah Insinerasi Internal",
  INCINERATION_IN_PROCESS: "Dalam Proses Insinerasi",
  STERILISED: "Diolah Autoklaf Internal",
  STERILIZATION_IN_PROCESS: "Sterilisasi / Disinfeksi",
  READY_FOR_TRANSPORT: "Siap Diangkut",
  TRANSPORTATION_REQUEST_CREATED: "Diserahkan ke Pengangkut",
  IN_TRANSIT: "Diangkut",
  HANDOVER_TO_TREATMENT: "Diserahkan ke Pengolah",
  READY_FOR_TREATMENT: "Diterima Pengolah",
  RECYCLED: "Didaur Ulang",
  LANDFILLED: "Residu",
  COLLECTED: "Diterima Pengangkutan Khusus",
  DISPOSED: "Pembuangan Sampah",
  IN_THIRD_PARTY_STORAGE: "Dalam Penyimpanan Pihak Ketiga",
};

function addTotalRow(
  ws: import("exceljs").Worksheet,
  dataRowCount: number,
  sumKeys: string[],
  labelCol: number
): void {
  const headerRowNum = 1;
  const firstDataRow = headerRowNum + 1;
  const lastDataRow = dataRowCount ? headerRowNum + dataRowCount : headerRowNum;
  const totalRow = ws.addRow([]);
  const totalRowNum = totalRow.number;

  ws.getCell(totalRowNum, labelCol).value = "Jumlah";
  ws.getCell(totalRowNum, labelCol).font = { bold: true };

  for (const key of sumKeys) {
    const colIndex = ws.columns.findIndex((c) => (c as { key?: string }).key === key) + 1;
    if (colIndex <= 0) continue;
    const cell = ws.getCell(totalRowNum, colIndex);
    if (dataRowCount) {
      const letter = ws.getColumn(colIndex).letter;
      cell.value = { formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})` };
    } else {
      cell.value = 0;
    }
    cell.font = { bold: true };
  }
}

function exportFilename(startDate: string, endDate: string): string {
  return `waste_all_${safeFilenamePart(startDate)}_${safeFilenamePart(endDate)}_${tsForFilename("Asia/Jakarta")}.xlsx`;
}

// Same tsForFilename/safeFilenamePart/buildContentDisposition trio as
// waste-bag-record.service.ts's export helpers (duplicated per-module rather
// than shared, matching that file's own precedent — no shared export-utils
// module exists yet in wms-encore).
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

function safeFilenamePart(s: unknown): string {
  return String(s ?? "")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 100);
}

export function buildContentDispositionForWasteTrackingExport(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
  const rfc5987 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}
