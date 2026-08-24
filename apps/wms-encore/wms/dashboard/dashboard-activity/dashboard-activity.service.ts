import * as repo from "./dashboard-activity.repository";
import { exportDateRangeSchema } from "./dashboard-activity.schema";
import type { ActivityFilters, ActivitySummaryRow, PaginatedActivityRows, UserActivitySummary } from "./dashboard-activity.types";

// dashboardActivityController.ts's handlers wrap everything in a single
// try/catch that does:
//   if (error instanceof Error || typeof error === 'string') res.error(error);
//   else res.error(req.t('common.server-error'));
// There is no res.fail(...) anywhere in this controller except the (dropped,
// see below) manual Bearer-token check — every error path, including the
// use-cases' own re-thrown `new Error(...)`, ends up as a plain, un-flagged
// Error. Under errorEnvelope (shared/http/envelope.ts) a plain `Error` (not an
// APIError) always maps to a 500 "error" envelope — so every error thrown from
// this service is intentionally a plain `Error`, never an APIError, to match
// byte-for-byte.

// paginationUtils.sanitizePaginationParams — apps/wms-service/src/shared/utils/pagination.ts
function sanitizePagination(limit?: number, page?: number): { limit: number; page: number } {
  const maxLimit = 1000;
  const safeLimit = Number.isInteger(limit) && (limit as number) > 0 ? Math.min(limit as number, maxLimit) : 10;
  const safePage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : 1;
  return { limit: safeLimit, page: safePage };
}

export async function getActivitySummariesForEntities(
  filters: ActivityFilters,
  limit?: number,
  page?: number,
): Promise<PaginatedActivityRows> {
  const { limit: safeLimit, page: safePage } = sanitizePagination(limit, page);
  const { data, total } = await repo.getActivitySummariesForEntities({
    limit: safeLimit,
    page: safePage,
    filters,
  });
  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / safeLimit),
      currentPage: safePage,
      perPage: safeLimit,
    },
  };
}

export async function getActivityManualScaleForEntities(
  filters: Omit<ActivityFilters, "typeOfProcessing">,
  limit?: number,
  page?: number,
): Promise<PaginatedActivityRows> {
  const { limit: safeLimit, page: safePage } = sanitizePagination(limit, page);
  const { data, total } = await repo.getActivityManualScaleForEntities({
    limit: safeLimit,
    page: safePage,
    filters,
  });
  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / safeLimit),
      currentPage: safePage,
      perPage: safeLimit,
    },
  };
}

export async function getUserActivitySummary(
  filters: ActivityFilters,
): Promise<UserActivitySummary> {
  return repo.getUserActivitySummary(filters);
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

export function buildExportFilename(startDate: string, endDate: string): string {
  return `activity_summary_${safeFilenamePart(startDate)}_${safeFilenamePart(endDate)}_${tsForFilename("Asia/Jakarta")}.xlsx`;
}

// Mirrors getActivitySummariesForEntitiesExport's dayHeaders derivation
// (1..N days between startDate/endDate) without re-querying the DB for dates.
function dayHeadersFor(startDate: string, endDate: string): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const headers: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    headers.push(String(cur.getDate()));
    cur.setDate(cur.getDate() + 1);
  }
  return headers;
}

export async function exportActivitySummariesForEntities(
  filters: ActivityFilters,
): Promise<{ buffer: Buffer; filename: string }> {
  // exportActivitySummariesForEntities's `if (!startDate || !endDate) throw new
  // Error(...)` guard — a plain Error, same 500-envelope path as everything
  // else in this controller (see note above).
  const parsed = exportDateRangeSchema.safeParse({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  if (!parsed.success) {
    throw new Error("startDate and endDate are required.");
  }
  const { startDate, endDate } = parsed.data;

  // Loaded lazily (rather than as a static top-level import) so this module
  // only pulls in exceljs's writer machinery when an export is actually
  // requested.
  const ExcelJS = (await import("exceljs")).default;

  // The original controller also manually re-checks for a Bearer
  // Authorization header here (`res.fail(missing-token, {isValidationError:
  // true})`), on top of the `authenticate` middleware the route already runs
  // through. Under Encore's `auth: true`, unauthenticated requests are
  // rejected by the framework before this handler runs at all, making that
  // manual check unreachable — dropped, same call made for
  // entity-location.service.ts's analogous branch.

  const [rows, manualScaleRows] = await Promise.all([
    repo.getActivitySummariesForEntitiesRaw(filters),
    repo.getActivityManualScaleForEntitiesRaw({ ...filters, typeOfProcessing: undefined }),
  ]);

  const manualScaleMap = new Map<unknown, ActivitySummaryRow>();
  for (const ms of manualScaleRows) {
    manualScaleMap.set(ms.healthcareFacilityId, ms);
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Activity Summary");
  wb.creator = "WMS";
  wb.created = new Date();

  const start = new Date(startDate);
  const end = new Date(endDate);
  const monthName = start.toLocaleString("id-ID", { month: "long" });
  const year = start.getFullYear();
  const headerMonthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

  const totalDaysInRange = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const dayHeaders = dayHeadersFor(startDate, endDate);
  const staticHeaders = ["No", "Provinsi", "Kabupaten/Kota", "Fasyankes"];
  const summaryHeaders = [
    "Jumlah Hari Aktif",
    "Jumlah Hari Tidak Aktif",
    "Jumlah Hari Manual Scale",
    "Jumlah Frekuensi",
    "Rata-rata Frekuensi",
  ];

  ws.addRow([]);
  ws.addRow([...staticHeaders, ...dayHeaders, ...summaryHeaders]);

  const startDayCol = staticHeaders.length + 1;
  const endDayCol = staticHeaders.length + dayHeaders.length;

  ws.mergeCells(1, startDayCol, 1, endDayCol);
  const headerCell = ws.getCell(1, startDayCol);
  headerCell.value = headerMonthYear;
  headerCell.alignment = { horizontal: "center", vertical: "middle" };
  headerCell.font = { bold: true, size: 12 };

  for (let i = 1; i <= staticHeaders.length; i++) {
    ws.mergeCells(1, i, 2, i);
    const cell = ws.getCell(1, i);
    cell.value = staticHeaders[i - 1];
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.font = { bold: true };
  }

  const afterDaysStart = endDayCol + 1;
  summaryHeaders.forEach((title, idx) => {
    const colIndex = afterDaysStart + idx;
    ws.mergeCells(1, colIndex, 2, colIndex);
    const c = ws.getCell(1, colIndex);
    c.value = title;
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.font = { bold: true };
  });

  const headerColor = "4472C4";
  for (let i = 1; i <= ws.columnCount; i++) {
    const c1 = ws.getCell(1, i);
    const c2 = ws.getCell(2, i);
    [c1, c2].forEach((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerColor } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  }

  ws.getRow(1).height = 20;
  ws.getRow(2).height = 22;

  rows.forEach((row, index) => {
    const manualScale = manualScaleMap.get(row.healthcareFacilityId);

    const valuesPerDay = dayHeaders.map((d) => Number(row[d] ?? 0));
    const jumlahHariAktif = valuesPerDay.filter((v) => v > 0).length;
    const jumlahHariTidakAktif = dayHeaders.length - jumlahHariAktif;
    const jumlahHariManualScale = manualScale
      ? dayHeaders.filter((d) => Number(manualScale[d] ?? 0) === 1).length
      : 0;

    const jumlahFrekuensi = valuesPerDay.reduce((a, b) => a + b, 0);
    const rataRataFrekuensi = totalDaysInRange > 0 ? jumlahFrekuensi / totalDaysInRange : 0;

    const excelRow = ws.addRow([
      index + 1,
      row.provinceName ?? "-",
      row.regencyName ?? "-",
      row.healthcareFacilityName ?? "-",
      ...valuesPerDay,
      jumlahHariAktif,
      jumlahHariTidakAktif,
      jumlahHariManualScale,
      jumlahFrekuensi,
      Math.round(rataRataFrekuensi * 100) / 100,
    ]);

    dayHeaders.forEach((day, i) => {
      if (manualScale && Number(manualScale[day]) === 1) {
        const cell = excelRow.getCell(staticHeaders.length + i + 1);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
        cell.font = { color: { argb: "FF000000" }, bold: true };
      }
    });

    excelRow.getCell(1).alignment = { horizontal: "center" };
    excelRow.getCell(2).alignment = { horizontal: "left" };
    excelRow.getCell(3).alignment = { horizontal: "left" };
    excelRow.getCell(4).alignment = { horizontal: "left" };

    for (let i = 0; i < dayHeaders.length; i++) {
      excelRow.getCell(staticHeaders.length + i + 1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }

    for (let i = 0; i < summaryHeaders.length; i++) {
      excelRow.getCell(afterDaysStart + i).alignment = { horizontal: "right", vertical: "middle" };
    }
  });

  ws.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });
  });

  for (let i = 1; i <= ws.columnCount; i++) {
    const col = ws.getColumn(i);
    let maxLength = 12;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const text = cell.value ? String(cell.value) : "";
      maxLength = Math.max(maxLength, text.length + 2);
    });
    col.width = Math.min(maxLength, 30);
  }

  ws.addRow([]);
  const infoRow = ws.addRow([`Periode: ${startDate ?? "-"} s/d ${endDate ?? "-"}`]);
  infoRow.font = { italic: true, size: 10 };
  ws.mergeCells(`A${infoRow.number}:C${infoRow.number}`);

  const buffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer as ArrayBuffer), filename: buildExportFilename(startDate, endDate) };
}
