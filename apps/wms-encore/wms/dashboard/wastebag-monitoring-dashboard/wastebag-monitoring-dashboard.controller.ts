// Routes — mirrors apps/wms-service's wasteBagMonitoringDashboardRoutes.ts
// (mounted at /api/v1/dashboard-monitoring, see interfaces/http/routes/index.ts):
//
//   GET  /api/v1/dashboard-monitoring/waste-group-summary-chart                        getWasteGroupSummaryChart
//   GET  /api/v1/dashboard-monitoring/waste-characteristics-summary-chart              getWasteCharacteristicsSummaryChart
//   GET  /api/v1/dashboard-monitoring/monthly-waste-bag-summary-chart                  getMonthlyWasteBagSummaryChart
//   GET  /api/v1/dashboard-monitoring/province-waste-bag-summary-chart                 getProvinceWasteBagSummaryChart
//   GET  /api/v1/dashboard-monitoring/regency-waste-bag-summary-chart                  getRegencyWasteBagSummaryChart
//   GET  /api/v1/dashboard-monitoring/entity-waste-bag-summary-chart                   getEntityWasteBagSummaryChart
//   GET  /api/v1/dashboard-monitoring/entity-waste-bag-summary-by-group                getEntityWasteBagSummaryByGroup
//   GET  /api/v1/dashboard-monitoring/entity-waste-bag-summary-by-characteristics      getEntityWasteBagSummaryByCharacteristics
//   GET  /api/v1/dashboard-monitoring/entity-waste-bag-summary-by-characteristics/export  getEntityWasteBagSummaryByCharacteristicsExport (raw/binary xlsx)
//
// All routes require `authenticate` + `authorizeRoles(allRead)` in the
// original (any authenticated, read-permitted role) -> `auth: true` here.
// None of them derive anything from the authenticated user (entityTag is a
// plain query param, not req.user-derived) so no getAuthData() usage here.

import { api } from "encore.dev/api";
import ExcelJS from "exceljs";
import { parseBoolean, resolveLang } from "./wastebag-monitoring-dashboard.schema";
import * as service from "./wastebag-monitoring-dashboard.service";
import type {
  EntityWasteBagSummaryByCharacteristicsRow,
  GetEntityWasteBagSummaryByCharacteristicsRequest,
  GetEntityWasteBagSummaryByCharacteristicsResponse,
  GetEntityWasteBagSummaryByGroupRequest,
  GetEntityWasteBagSummaryByGroupResponse,
  GetEntityWasteBagSummaryChartRequest,
  GetEntityWasteBagSummaryChartResponse,
  GetMonthlyWasteBagSummaryChartRequest,
  GetMonthlyWasteBagSummaryChartResponse,
  GetProvinceWasteBagSummaryChartRequest,
  GetProvinceWasteBagSummaryChartResponse,
  GetRegencyWasteBagSummaryChartRequest,
  GetRegencyWasteBagSummaryChartResponse,
  GetWasteCharacteristicsSummaryChartRequest,
  GetWasteCharacteristicsSummaryChartResponse,
  GetWasteGroupSummaryChartRequest,
  GetWasteGroupSummaryChartResponse,
} from "./wastebag-monitoring-dashboard.types";

// Ported faithfully from
// WasteBagMonitoringDashboardRepositoryImpl.getEntityWasteBagSummaryByCharacteristicsExport
// in apps/wms-service (the ExcelJS workbook-building logic — headers, merged
// title rows, styling, totals row, autofilter/freeze pane). The row shape
// here (value/avgValue/maxValue/gapValue) is the encore service's already
// lang/isBags-resolved projection of the original's
// totalBagsCurrentMonth/totalWeightCurrentMonth/... fields.
function buildEntityWasteBagSummaryByCharacteristicsWorkbook(
  data: EntityWasteBagSummaryByCharacteristicsRow[],
  opts: { startDate?: string; endDate?: string; isBags?: boolean; lang: string },
): Promise<ExcelJS.Buffer> {
  const { startDate, endDate, isBags, lang } = opts;

  const wb = new ExcelJS.Workbook();
  wb.creator = "WMS";
  wb.created = new Date();

  const ws = wb.addWorksheet("Timbulan Per Entitas Lengkap", {
    headerFooter: {
      firstHeader: "WMS - Timbulan Per Entitas Lengkap",
      firstFooter: "WMS Report Export",
    },
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const fmtIdLong = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  const displayStart = startDate ?? "N/A";
  const displayEnd = endDate ?? "N/A";

  const titleText =
    lang === "en"
      ? `Waste Bag By Entity Complete (${isBags ? "Bag" : "Weight"})`
      : `Timbulan Per Entitas Lengkap (${isBags ? "Kantong" : "KG"})`;
  const periodText = `${fmtIdLong(displayStart)} - ${fmtIdLong(displayEnd)}`;

  ws.addRow([titleText]);
  ws.mergeCells("A1:I1");
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

  ws.addRow([periodText]);
  ws.mergeCells("A2:I2");
  ws.getCell("A2").font = { bold: true, size: 14 };
  ws.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };

  ws.addRow([]); // spacer row before header

  const staticHeaders =
    lang === "en"
      ? [
          "No",
          "Province",
          "Regency/City",
          "Healthcare Facility",
          "Waste Type - Group - Characteristics",
          isBags ? "Total Bags (Current Month)" : "Total Weight (kg)",
          isBags ? "Avg Bags (Last 3 Months)" : "Avg Weight (kg) (Last 3 Months)",
          isBags ? "Max Bags (Last 3 Months)" : "Max Weight (kg) (Last 3 Months)",
          isBags ? "Gap Bags" : "Gap Weight (kg)",
        ]
      : [
          "No",
          "Provinsi",
          "Kabupaten/Kota",
          "Nama Entitas",
          "Jenis / Kelompok / Karakteristik Limbah",
          "Total Timbulan",
          "Proyeksi Timbulan (Rata2 timbulan)",
          "Max Timbulan",
          "Gap Timbulan",
        ];

  ws.addRow(staticHeaders);

  const headerRow = ws.getRow(4);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  ws.columns = [
    { width: 5 },
    { width: 18 },
    { width: 18 },
    { width: 30 },
    { width: 40 },
    { width: 22 },
    { width: 25 },
    { width: 25 },
    { width: 18 },
  ];

  data.forEach((r, index) => {
    ws.addRow([
      index + 1,
      r.provinceName || "-",
      r.regencyName || "-",
      r.healthcareFacilityName,
      r.wasteFullName,
      Number(r.value) || 0,
      Number(r.avgValue) || 0,
      Number(r.maxValue) || 0,
      Number(r.gapValue) || 0,
    ]);
  });

  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 4) return;
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: colNumber >= 6 ? "right" : "left", vertical: "middle" };
    });

    if (rowNumber > 4 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } };
      });
    }
  });

  if (data.length > 0) {
    const totalValue = (key: "value" | "avgValue" | "maxValue" | "gapValue") =>
      data.reduce((sum, d) => sum + (Number(d[key]) || 0), 0);

    const totalRow = [
      "",
      "",
      "",
      "",
      "TOTAL",
      totalValue("value"),
      totalValue("avgValue"),
      totalValue("maxValue"),
      totalValue("gapValue"),
    ];

    const row = ws.addRow(totalRow);
    row.font = { bold: true };
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "double" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: colNumber >= 6 ? "right" : "left" };
    });
  }

  ws.autoFilter = { from: "A4", to: "I4" };
  ws.views = [{ state: "frozen", ySplit: 4 }];

  return wb.xlsx.writeBuffer();
}

export const getWasteGroupSummaryChart = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/waste-group-summary-chart",
    auth: true,
    expose: true,
  },
  async (
    req: GetWasteGroupSummaryChartRequest,
  ): Promise<GetWasteGroupSummaryChartResponse> => {
    const data = await service.getWasteGroupSummaryChart({
      ...req,
      isBags: parseBoolean(req.isBags),
      lang: resolveLang(req.acceptLanguage),
    });
    return { status: "success", data };
  },
);

export const getWasteCharacteristicsSummaryChart = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/waste-characteristics-summary-chart",
    auth: true,
    expose: true,
  },
  async (
    req: GetWasteCharacteristicsSummaryChartRequest,
  ): Promise<GetWasteCharacteristicsSummaryChartResponse> => {
    const data = await service.getWasteCharacteristicsSummaryChart({
      ...req,
      isBags: parseBoolean(req.isBags),
      lang: resolveLang(req.acceptLanguage),
    });
    return { status: "success", data };
  },
);

export const getMonthlyWasteBagSummaryChart = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/monthly-waste-bag-summary-chart",
    auth: true,
    expose: true,
  },
  async (
    req: GetMonthlyWasteBagSummaryChartRequest,
  ): Promise<GetMonthlyWasteBagSummaryChartResponse> => {
    const data = await service.getMonthlyWasteBagSummaryChart({
      ...req,
      isBags: parseBoolean(req.isBags),
    });
    return { status: "success", data };
  },
);

export const getProvinceWasteBagSummaryChart = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/province-waste-bag-summary-chart",
    auth: true,
    expose: true,
  },
  async (
    req: GetProvinceWasteBagSummaryChartRequest,
  ): Promise<GetProvinceWasteBagSummaryChartResponse> => {
    const data = await service.getProvinceWasteBagSummaryChart({
      ...req,
      isBags: parseBoolean(req.isBags),
    });
    return { status: "success", data };
  },
);

export const getRegencyWasteBagSummaryChart = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/regency-waste-bag-summary-chart",
    auth: true,
    expose: true,
  },
  async (
    req: GetRegencyWasteBagSummaryChartRequest,
  ): Promise<GetRegencyWasteBagSummaryChartResponse> => {
    const data = await service.getRegencyWasteBagSummaryChart({
      ...req,
      isBags: parseBoolean(req.isBags),
    });
    return { status: "success", data };
  },
);

export const getEntityWasteBagSummaryChart = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/entity-waste-bag-summary-chart",
    auth: true,
    expose: true,
  },
  async (
    req: GetEntityWasteBagSummaryChartRequest,
  ): Promise<GetEntityWasteBagSummaryChartResponse> => {
    const data = await service.getEntityWasteBagSummaryChart({
      ...req,
      isBags: parseBoolean(req.isBags),
    });
    return { status: "success", data };
  },
);

export const getEntityWasteBagSummaryByGroup = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/entity-waste-bag-summary-by-group",
    auth: true,
    expose: true,
  },
  async (
    req: GetEntityWasteBagSummaryByGroupRequest,
  ): Promise<GetEntityWasteBagSummaryByGroupResponse> => {
    const data = await service.getEntityWasteBagSummaryByGroup({
      ...req,
      isBags: parseBoolean(req.isBags),
      lang: resolveLang(req.acceptLanguage),
    });
    return { status: "success", data };
  },
);

export const getEntityWasteBagSummaryByCharacteristics = api(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/entity-waste-bag-summary-by-characteristics",
    auth: true,
    expose: true,
  },
  async (
    req: GetEntityWasteBagSummaryByCharacteristicsRequest,
  ): Promise<GetEntityWasteBagSummaryByCharacteristicsResponse> => {
    const data = await service.getEntityWasteBagSummaryByCharacteristics({
      ...req,
      isBags: parseBoolean(req.isBags),
      lang: resolveLang(req.acceptLanguage),
    });
    return { status: "success", data };
  },
);

// The export endpoint is raw (binary xlsx download with a
// Content-Disposition attachment header), like the original's
// res.set({...}); res.status(200).send(buffer) — there is no JSON
// api()-typed response for this one; query params are parsed by hand off
// the raw request URL, mirroring req.query in the original controller.
export const getEntityWasteBagSummaryByCharacteristicsExport = api.raw(
  {
    method: "GET",
    path: "/api/v1/dashboard-monitoring/entity-waste-bag-summary-by-characteristics/export",
    auth: true,
    expose: true,
  },
  async (req, resp) => {
    const url = new URL(req.url ?? "", "http://internal");
    const q = url.searchParams;
    const numOrUndef = (v: string | null) => (v && v.trim() !== "" ? Number(v) : undefined);

    const acceptLanguage = req.headers["accept-language"];
    const acceptLanguageStr = Array.isArray(acceptLanguage) ? acceptLanguage[0] : acceptLanguage;

    const startDate = q.get("startDate") ?? undefined;
    const endDate = q.get("endDate") ?? undefined;

    const isBags = parseBoolean(q.get("isBags") ?? undefined);
    const lang = resolveLang(acceptLanguageStr);

    const rows = await service.getEntityWasteBagSummaryByCharacteristicsForExport({
      limit: numOrUndef(q.get("limit")),
      page: numOrUndef(q.get("page")),
      startDate,
      endDate,
      provinceId: numOrUndef(q.get("provinceId")),
      regencyId: numOrUndef(q.get("regencyId")),
      healthcareFacilityId: numOrUndef(q.get("healthcareFacilityId")),
      entityTag: q.get("entityTag") ?? undefined,
      wasteTypeId: numOrUndef(q.get("wasteTypeId")),
      wasteGroupId: numOrUndef(q.get("wasteGroupId")),
      wasteCharacteristicsId: numOrUndef(q.get("wasteCharacteristicsId")),
      isBags,
      orderBy: q.get("orderBy") ?? undefined,
      lang,
    });

    // Ported from the original's WasteBagMonitoringDashboardRepositoryImpl
    // ExcelJS workbook-building (headers, merged title, styling, totals
    // row, autofilter/freeze pane) — see
    // buildEntityWasteBagSummaryByCharacteristicsWorkbook above.
    const buffer = await buildEntityWasteBagSummaryByCharacteristicsWorkbook(rows, {
      startDate,
      endDate,
      isBags,
      lang,
    });

    const safe = (s: unknown) =>
      String(s ?? "")
        .trim()
        .replace(/[^\w.-]+/g, "-")
        .slice(0, 100);
    const tsForFilename = (tz = "Asia/Jakarta") => {
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
      const parts = Object.fromEntries(dtf.formatToParts(new Date()).map((p) => [p.type, p.value]));
      return `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
    };
    const buildContentDisposition = (filename: string) => {
      const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
      const rfc5987 = encodeURIComponent(filename);
      return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
    };
    const filename = `entity_full_${safe(startDate)}_${safe(endDate)}_${tsForFilename()}.xlsx`;

    const nodeBuffer = Buffer.from(buffer);
    resp.writeHead(200, {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": buildContentDisposition(filename),
      "Cache-Control": "no-store",
      "Content-Length": nodeBuffer.length.toString(),
    });
    resp.end(nodeBuffer);
  },
);
