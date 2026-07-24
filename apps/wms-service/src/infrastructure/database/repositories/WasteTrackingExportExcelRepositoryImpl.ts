import * as Excel from 'exceljs';
import { sequelize } from '../db.connection';
import { QueryTypes } from 'sequelize';
import ExportExcelRepository from '../../../domain/repositories/WasteTrackingExportExcelRepository';
import { WASTE_STATUS_LABEL } from '../../../domain/entities/WasteBag';
import { buildWasteSourceLabelSQL } from '../../../shared/utils/buildWasteSourceLabelSQL';
import { isOnlyAdmin } from '../../../shared/utils/role';
import { WASTE_STATUS } from '../../../shared/utils/dictionary';

export default class WasteTrackingExportExcelRepositoryImpl implements ExportExcelRepository {
  async getWasteCharacteristicsSummaryForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer> {
    const [data] = await Promise.all([
      this.fetchWasteCharacteristicsSummary(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
      ),
    ]);

    // ------------------ Excel ------------------
    const wb = new Excel.Workbook();
    wb.creator = 'WMS';
    wb.created = new Date();
    const ws = wb.addWorksheet('WasteSummary');

    ws.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'healthcareFacilityName', header: 'Fasyankes', width: 25 },
      { key: 'wasteTypeName', header: 'Jenis', width: 22 },
      { key: 'wasteGroupName', header: 'Kelompok', width: 16 },
      { key: 'wasteCharacteristicsName', header: 'Karakteristik', width: 20 },
      { key: 'wasteStatus', header: 'Tindak Lanjut', width: 20 },
      { key: 'totalWeightInKgs', header: 'Total Berat (Kg)', width: 18 },
      { key: 'avgWeightPerDay', header: 'Rata-rata berat per hari', width: 18 },
      { key: 'totalWasteBag', header: 'Jumlah kantong', width: 15 },
      {
        key: 'avgWasteBagPerDay',
        header: 'Jumlah Rata-rata kantong per hari (Kantong)',
        width: 18,
      },
    ];

    // ------------------ Border Style ------------------
    const borderThin: Partial<Excel.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    const lastCol = ws.columns.length;

    // ------------------ Helper Merge & Center ------------------
    const mergeAndCenter = (row: number, colStart: number, colEnd: number, value: string) => {
      ws.mergeCells(row, colStart, row, colEnd);
      const cell = ws.getCell(row, colStart);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true };
    };

    const fmtIdLong = (date: string) =>
      new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    // ------------------ Judul 3 Baris ------------------
    const name = data?.[0]?.healthcareFacilityName;
    const facility = (healthcareFacilityId && name ? name : '').toUpperCase();

    mergeAndCenter(1, 1, lastCol, 'Ringkasan per Karakteristik Limbah');
    mergeAndCenter(2, 1, lastCol, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    // ------------------ Header ------------------
    const headerRow = ws.addRow(ws.columns.map((c) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });

    // ------------------ Data Rows ------------------
    const startRowCharacteristics = 5;
    let mergeStartRow = startRowCharacteristics;
    let lastHealthcareFacility = '';
    console.log(data[0]);
    data.forEach((item, idx) => {
      const currentExcelRow = idx + startRowCharacteristics;
      const healthcareFacilityName =
        item.healthcareFacilityName !== lastHealthcareFacility ? item.healthcareFacilityName : '';
      const row = ws.addRow({
        no: idx + 1,
        healthcareFacilityName,
        wasteTypeName: item.wasteTypeName,
        wasteGroupName: item.wasteGroupName,
        wasteCharacteristicsName: item.wasteCharacteristicsName,
        wasteStatus: WASTE_STATUS[item.wasteStatus] || item.wasteStatus,
        totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
        avgWeightPerDay: Number(item.avgWeightPerDay) || 0,
        totalWasteBag: Number(item.totalWasteBag) || 0,
        avgWasteBagPerDay: Number(item.avgWasteBagPerDay) || 0,
      });

      row.eachCell((cell, col) => {
        cell.border = borderThin;

        if (col === 1) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if ([7, 8, 10].includes(col)) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (col === 7) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if ([3, 4, 5, 6].includes(col)) {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
        }
        if (col === 2) cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      });

      // merge previous group when facility changes
      if (lastHealthcareFacility && item.healthcareFacilityName !== lastHealthcareFacility) {
        const mergeEndRow = currentExcelRow - 1;

        // merge only if more than 1 row
        if (mergeStartRow < mergeEndRow) {
          ws.mergeCells(`B${mergeStartRow}:B${mergeEndRow}`);
        }

        mergeStartRow = currentExcelRow;
      }

      lastHealthcareFacility = item.healthcareFacilityName;
    });
    // merge last group
    const lastRowCharacteristic = data.length + startRowCharacteristics - 1;

    if (mergeStartRow < lastRowCharacteristic) {
      ws.mergeCells(`B${mergeStartRow}:B${lastRowCharacteristic}`);
    }

    // ------------------ Total Row ------------------
    const firstDataRow = headerRow.number + 1;
    const lastDataRow = ws.lastRow?.number || headerRow.number;
    const totalRow = ws.addRow([]);
    const totalRowNum = totalRow.number;

    ws.mergeCells(totalRowNum, 1, totalRowNum, 5);
    const jumlahCell = ws.getCell(totalRowNum, 1);
    jumlahCell.value = 'Jumlah';
    jumlahCell.alignment = { horizontal: 'right', vertical: 'middle' };
    jumlahCell.font = { bold: true };

    ws.getCell(totalRowNum, 7).value = { formula: `SUM(G${firstDataRow}:G${lastDataRow})` };
    ws.getCell(totalRowNum, 8).value = { formula: `SUM(H${firstDataRow}:H${lastDataRow})` };
    ws.getCell(totalRowNum, 9).value = { formula: `SUM(I${firstDataRow}:I${lastDataRow})` };
    ws.getCell(totalRowNum, 10).value = { formula: `SUM(J${firstDataRow}:J${lastDataRow})` };

    [7, 8, 10].forEach((c) => {
      const cell = ws.getCell(totalRowNum, c);
      cell.numFmt = '#,##0.00';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.font = { bold: true };
    });

    const totalBagCell = ws.getCell(totalRowNum, 7);
    totalBagCell.numFmt = '#,##0';
    totalBagCell.alignment = { horizontal: 'right', vertical: 'middle' };
    totalBagCell.font = { bold: true };

    for (let c = 1; c <= lastCol; c++) {
      ws.getCell(totalRowNum, c).border = borderThin;
    }

    // ------------------ Output Buffer ------------------
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async getWasteRecordCharacteristicsSummaryForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer> {
    const [data] = await Promise.all([
      this.fetchWasteRecordCharacteristicsSummary(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
      ),
    ]);

    // ------------------ Excel ------------------
    const wb = new Excel.Workbook();
    wb.creator = 'WMS';
    wb.created = new Date();
    const ws = wb.addWorksheet('WasteRecordSummary');

    ws.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'wasteTypeName', header: 'Jenis', width: 22 },
      { key: 'wasteGroupName', header: 'Kelompok', width: 16 },
      { key: 'wasteCharacteristicsName', header: 'Karakteristik', width: 20 },
      { key: 'totalWeightInKgs', header: 'Total Berat (Kg)', width: 18 },
      { key: 'avgWeightPerDay', header: 'Rata-rata berat per hari', width: 18 },
      { key: 'totalWasteBag', header: 'Jumlah kantong', width: 15 },
      {
        key: 'avgWasteBagPerDay',
        header: 'Jumlah Rata-rata kantong per hari (Kantong)',
        width: 18,
      },
    ];

    // ------------------ Border Style ------------------
    const borderThin: Partial<Excel.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    const lastCol = ws.columns.length;

    // ------------------ Helper Merge & Center ------------------
    const mergeAndCenter = (row: number, colStart: number, colEnd: number, value: string) => {
      ws.mergeCells(row, colStart, row, colEnd);
      const cell = ws.getCell(row, colStart);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true };
    };

    const fmtIdLong = (date: string) =>
      new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    // ------------------ Judul 3 Baris ------------------
    const name = data?.[0]?.healthcareFacilityName;
    const facility = (healthcareFacilityId && name ? name : '').toUpperCase();
    mergeAndCenter(1, 1, lastCol, 'Penimbangan Awal - Ringkasan per Karakteristik Limbah');
    mergeAndCenter(2, 1, lastCol, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    // ------------------ Header ------------------
    const headerRow = ws.addRow(ws.columns.map((c) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });

    // ------------------ Data Rows ------------------
    data.forEach((item, idx) => {
      const row = ws.addRow({
        no: idx + 1,
        wasteTypeName: item.wasteTypeName,
        wasteGroupName: item.wasteGroupName,
        wasteCharacteristicsName: item.wasteCharacteristicsName,
        totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
        avgWeightPerDay: Number(item.avgWeightPerDay) || 0,
        totalWasteBag: Number(item.totalWasteBag) || 0,
        avgWasteBagPerDay: Number(item.avgWasteBagPerDay) || 0,
      });

      row.eachCell((cell, col) => {
        cell.border = borderThin;

        if (col === 1) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if ([5, 6, 8].includes(col)) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (col === 7) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      });
    });

    // ------------------ Total Row ------------------
    const firstDataRow = headerRow.number + 1;
    const lastDataRow = ws.lastRow?.number || headerRow.number;
    const totalRow = ws.addRow([]);
    const totalRowNum = totalRow.number;

    ws.mergeCells(totalRowNum, 1, totalRowNum, 4);
    const jumlahCell = ws.getCell(totalRowNum, 1);
    jumlahCell.value = 'Jumlah';
    jumlahCell.alignment = { horizontal: 'right', vertical: 'middle' };
    jumlahCell.font = { bold: true };

    ws.getCell(totalRowNum, 5).value = { formula: `SUM(E${firstDataRow}:E${lastDataRow})` };
    ws.getCell(totalRowNum, 6).value = { formula: `SUM(F${firstDataRow}:F${lastDataRow})` };
    ws.getCell(totalRowNum, 7).value = { formula: `SUM(G${firstDataRow}:G${lastDataRow})` };
    ws.getCell(totalRowNum, 8).value = { formula: `SUM(H${firstDataRow}:H${lastDataRow})` };

    [5, 6, 8].forEach((c) => {
      const cell = ws.getCell(totalRowNum, c);
      cell.numFmt = '#,##0.00';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.font = { bold: true };
    });

    const totalBagCell = ws.getCell(totalRowNum, 7);
    totalBagCell.numFmt = '#,##0';
    totalBagCell.alignment = { horizontal: 'right', vertical: 'middle' };
    totalBagCell.font = { bold: true };

    for (let c = 1; c <= lastCol; c++) {
      ws.getCell(totalRowNum, c).border = borderThin;
    }

    // ------------------ Output Buffer ------------------
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async getWasteSourceSummaryForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer> {
    const [data] = await Promise.all([
      this.fetchWasteSourceSummary(startDate, endDate, provinceId, regencyId, healthcareFacilityId),
    ]);

    // ------------------ Excel ------------------
    const wb = new Excel.Workbook();
    wb.creator = 'WMS';
    wb.created = new Date();
    const ws = wb.addWorksheet('WasteSourceSummary');

    ws.columns = [
      { key: 'no', header: 'No', width: 5 }, // A
      { key: 'sourceType', header: 'Tipe Sumber Limbah', width: 22 }, // B
      { key: 'wasteSourceName', header: 'Nama Sumber Limbah', width: 30 }, // C
      { key: 'totalWasteBag', header: 'Total Kantong Limbah', width: 15 }, // D
      { key: 'totalWeightInKgs', header: 'Total Berat (Kg)', width: 18 }, // E
    ];

    // ------------------ Border Style ------------------
    const borderThin: Partial<Excel.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    const lastCol = ws.columns.length;

    // ------------------ Helper Merge & Center ------------------
    const mergeAndCenter = (row: number, colStart: number, colEnd: number, value: string) => {
      ws.mergeCells(row, colStart, row, colEnd);
      const cell = ws.getCell(row, colStart);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true };
    };

    const fmtIdLong = (date: string) =>
      new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    // ------------------ Judul 3 Baris ------------------
    const name = data?.[0]?.healthcareFacilityName;
    const facility = (healthcareFacilityId && name ? name : '').toUpperCase();
    mergeAndCenter(1, 1, lastCol, 'Ringkasan per Sumber Limbah');
    mergeAndCenter(2, 1, lastCol, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    // ------------------ Header ------------------
    const headerRow = ws.addRow(ws.columns.map((c) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });

    // ------------------ Data Rows ------------------
    data.forEach((item, idx) => {
      const row = ws.addRow({
        no: idx + 1,
        sourceType: item.sourceType,
        wasteSourceName: item.wasteSourceName,
        totalWasteBag: Number(item.totalWasteBag) || 0,
        totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
      });

      row.eachCell((cell, col) => {
        cell.border = borderThin;

        if (col === 1) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (col === 4) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (col === 5) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      });
    });

    // ------------------ Total Row ------------------
    const firstDataRow = headerRow.number + 1;
    const lastDataRow = ws.lastRow?.number || headerRow.number;

    const totalRow = ws.addRow([]);
    const totalRowNum = totalRow.number;

    ws.mergeCells(totalRowNum, 1, totalRowNum, 3);
    const jumlahCell = ws.getCell(totalRowNum, 1);
    jumlahCell.value = 'Jumlah';
    jumlahCell.alignment = { horizontal: 'right', vertical: 'middle' };
    jumlahCell.font = { bold: true };

    ws.getCell(totalRowNum, 4).value = { formula: `SUM(D${firstDataRow}:D${lastDataRow})` };
    ws.getCell(totalRowNum, 5).value = { formula: `SUM(E${firstDataRow}:E${lastDataRow})` };

    ws.getCell(totalRowNum, 4).numFmt = '#,##0';
    ws.getCell(totalRowNum, 5).numFmt = '#,##0.00';

    for (let c = 1; c <= lastCol; c++) {
      const cell = ws.getCell(totalRowNum, c);
      cell.border = borderThin;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    // ------------------ Output Buffer ------------------
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async getWasteBagExportForExcel(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    search?: string,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<Buffer> {
    const [rows] = await Promise.all([
      this.fetchWasteBags(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        search,
        wasteTypeId,
        wasteGroupId,
        wasteCharacteristicsId,
      ),
    ]);

    // ------------------ Excel ------------------
    const wb = new Excel.Workbook();
    wb.creator = 'WMS';
    wb.created = new Date();

    const ws = wb.addWorksheet('Timbulan per Kantong Limbah', {
      properties: { tabColor: { argb: 'FFEEEEEE' } },
    });

    // ------------------ Columns ------------------
    ws.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'qrCode', header: 'Kode Kantong Limbah', width: 22 },
      { key: 'wasteCode', header: 'Kode Limbah', width: 16 },
      { key: 'wasteTypeName', header: 'Jenis Limbah', width: 22 },
      { key: 'wasteGroupName', header: 'Kelompok Limbah', width: 22 },
      { key: 'wasteCharacteristicsName', header: 'Karakteristik Limbah', width: 24 },
      { key: 'wasteSource', header: 'Sumber Limbah', width: 28 },
      { key: 'transporterName', header: 'Pengangkut', width: 22 },
      { key: 'thirdPartyName', header: 'Pengolah Limbah', width: 22 },
      { key: 'checkInDate', header: 'Tanggal Masuk', width: 20 },
      { key: 'storageMax', header: 'Maksimal Penyimpanan (Hari)', width: 22 },
      { key: 'weightInKgs', header: 'Berat Masuk (Kg)', width: 16 },
      { key: 'firstName', header: 'Nama Operator', width: 22 },
      { key: 'wasteStatus', header: 'Status', width: 16 },
    ];

    const lastCol = ws.columns.length;

    // ------------------ Border Style ------------------
    const borderThin: Partial<Excel.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    // ------------------ Helper Functions ------------------
    const toColLetter = (n: number): string => {
      let s = '';
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    };

    const colIndexByKey = (key: string) => ws.columns.findIndex((c: any) => c.key === key) + 1;

    const fmtIdLong = (date: string) =>
      new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    const mergeAndCenter = (row: number, colStart: number, colEnd: number, value: string) => {
      ws.mergeCells(row, colStart, row, colEnd);
      const cell = ws.getCell(row, colStart);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true };
    };

    // ------------------ Judul 3 Baris ------------------
    const facility = (rows?.[0]?.healthcareFacilityName ?? '').toUpperCase();

    mergeAndCenter(1, 1, lastCol, 'Timbulan per Kantong Limbah');
    mergeAndCenter(2, 1, lastCol, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    // ------------------ Header ------------------
    const headerRow = ws.addRow(ws.columns.map((c: any) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });

    ws.views = [{ state: 'frozen', ySplit: 4 }];
    ws.autoFilter = {
      from: { row: headerRow.number, column: 1 },
      to: { row: headerRow.number, column: lastCol },
    };

    // ------------------ Data Rows ------------------
    const toExcelDate = (v: any) => (v ? new Date(v) : null);

    rows.forEach((item, idx) => {
      const row = ws.addRow({
        no: idx + 1,
        qrCode: item.qrCode,
        wasteCode: item.wasteCode || '-',
        wasteTypeName: item.wasteTypeName,
        wasteGroupName: item.wasteGroupName,
        wasteCharacteristicsName: item.wasteCharacteristicsName,
        wasteSource: item.wasteSource,
        transporterName: item.transporterName || '-',
        thirdPartyName: item.thirdPartyName || '-',
        checkInDate: toExcelDate(item.checkInDate),
        storageMax: item.storageMax != null ? Number(item.storageMax) : '-',
        weightInKgs: Number(item.weightInKgs) || 0,
        firstName: item.firstName || '-',
        wasteStatus: item.wasteStatus,
      });

      row.eachCell((cell, colNumber) => {
        cell.border = borderThin;
        const key = (ws.columns[colNumber - 1] as any)?.key as string;

        if (key === 'no') {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (key === 'storageMax') {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (key === 'weightInKgs') {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (key === 'checkInDate') {
          cell.numFmt = 'yyyy-mm-dd hh:mm';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      });
    });

    // ------------------ Total Row ------------------
    const firstDataRow = headerRow.number + 1;
    const lastDataRow = rows.length ? headerRow.number + rows.length : headerRow.number;
    const totalRow = ws.addRow([]);
    const totalRowNum = totalRow.number;

    const totalLabelCell = ws.getCell(totalRowNum, 1);
    totalLabelCell.value = 'TOTAL';
    totalLabelCell.font = { bold: true };
    totalLabelCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // SUM untuk kolom berat masuk
    const sumKey = 'weightInKgs';
    const ci = colIndexByKey(sumKey);
    const sumCell = ws.getCell(totalRowNum, ci);

    if (rows.length) {
      const letter = toColLetter(ci);
      sumCell.value = { formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})` };
    } else {
      sumCell.value = 0;
    }

    sumCell.numFmt = '#,##0.00';
    sumCell.font = { bold: true };
    sumCell.alignment = { horizontal: 'right', vertical: 'middle' };

    // Border baris total
    for (let c = 1; c <= lastCol; c++) {
      ws.getCell(totalRowNum, c).border = borderThin;
    }

    // ------------------ Output Buffer ------------------
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async getWasteGroupExportForExcel(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer> {
    // ------------------ SQL ------------------
    const wbAlias = 'wb_agg';

    const whereClauses: string[] = [];
    const replacements: Record<string, any> = {
      startDate: `${startDate} 00:00:00`,
      endDate: `${endDate} 23:59:59`,
    };

    if (provinceId) {
      whereClauses.push(`${wbAlias}.province_id = :provinceId`);
      replacements.provinceId = provinceId;
    }
    if (regencyId) {
      whereClauses.push(`${wbAlias}.regency_id = :regencyId`);
      replacements.regencyId = regencyId;
    }
    if (healthcareFacilityId) {
      whereClauses.push(`${wbAlias}.healthcare_facility_id = :healthcareFacilityId`);
      replacements.healthcareFacilityId = healthcareFacilityId;
    }

    const andFilters = whereClauses.length ? `AND ${whereClauses.join(' AND ')}` : '';

    const sql = `
        WITH filtered_data AS (
            SELECT
                wrg.id                                   AS wasteGroupId,
                wrg.group_id                             AS wasteGroupNumber,
                wrg.total_bags_count                     AS totalBagsCount,
                wrg.total_weight_in_kgs                  AS totalWeightInKgs,
                wrg.transporter_operator_id              AS transporterOperatorId,
                pv.vehicle_number                        AS vehicleNumber,
                wrg.transporter_id                       AS providerId,
                wrg.updated_at                           AS pickupTime,
                CASE WHEN ${wbAlias}.disposal_method = 'TRANSPORTER_TREATMENT' THEN wrg.updated_at ELSE NULL END AS processTime,
                CASE WHEN ${wbAlias}.disposal_method = 'TRANSPORTER_LANDFILL'  THEN wrg.updated_at ELSE NULL END AS landfillTime,
                CASE WHEN ${wbAlias}.disposal_method = 'TRANSPORTER_RECYCLER'  THEN wrg.updated_at ELSE NULL END AS recycleTime,
                ${wbAlias}.healthcare_facility_name      AS healthcareFacilityName,
                ${wbAlias}.transporter_name              AS thirdPartyName,
                ${wbAlias}.healthcare_facility_id        AS healthcareFacilityId,
                ${wbAlias}.disposal_method               AS disposalMethod,
                ${wbAlias}.province_id                   AS provinceId,
                ${wbAlias}.regency_id                    AS regencyId,
                ${wbAlias}.province_name                 AS provinceName,
                ${wbAlias}.regency_name                  AS regencyName,
                us.firstname AS firstName
            FROM waste_transportation_external_group wrg
            LEFT JOIN partner_vehicle pv
                ON pv.id = wrg.transporter_vehicle_id
            LEFT JOIN waste_treatment_external_group wtrg
                ON wtrg.group_id = wrg.group_id
            LEFT JOIN users us ON us.user_uuid = wrg.transporter_operator_id
            JOIN (
                SELECT
                    wb.waste_transportation_external_group_id AS group_id,
                    MIN(wb.healthcare_facility_id)            AS healthcare_facility_id,
                    MIN(wb.healthcare_facility_name)          AS healthcare_facility_name,
                    MIN(wb.transporter_name)                  AS transporter_name,
                    MIN(wb.province_id)                       AS province_id,
                    MIN(wb.regency_id)                        AS regency_id,
                    MIN(wb.province_name)                     AS province_name,
                    MIN(wb.regency_name)                      AS regency_name,
                    MIN(wc.disposal_method)                   AS disposal_method
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                WHERE wb.waste_transportation_external_group_id IS NOT NULL
                GROUP BY wb.waste_transportation_external_group_id
            ) ${wbAlias}
                ON ${wbAlias}.group_id = wrg.id
            WHERE CONVERT_TZ(wrg.updated_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate
            ${andFilters}
        )
        SELECT * FROM filtered_data
        ORDER BY pickupTime ASC
    `;

    const rows = (await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    })) as Array<Record<string, any>>;

    // ------------------ Excel ------------------
    const wb = new Excel.Workbook();
    wb.creator = 'WMS';
    wb.created = new Date();

    const ws = wb.addWorksheet('Pelacakan Limbah Keluar', {
      properties: { tabColor: { argb: 'FFEEEEEE' } },
    });

    ws.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'wasteGroupNumber', header: 'Nomor Kelompok Limbah', width: 18 },
      { key: 'totalWeightInKgs', header: 'Berat Limbah (Kg)', width: 16 },
      { key: 'thirdPartyName', header: 'Pihak Ketiga', width: 26 },
      { key: 'firstName', header: 'Petugas Pengangkut', width: 20 },
      { key: 'vehicleNumber', header: 'Nomor Plat Kendaraan', width: 18 },
      { key: 'pickupTime', header: 'Waktu Diangkut', width: 22 },
      { key: 'processTime', header: 'Waktu Diolah', width: 18 },
      { key: 'landfillTime', header: 'Waktu Ditimbus', width: 18 },
      { key: 'recycleTime', header: 'Waktu Diangkut Pemanfaat', width: 22 },
    ];

    const borderThin = { style: 'thin' as const, color: { argb: 'FF000000' } };

    // ------------------ Helper ------------------
    const toColLetter = (n: number) => {
      let s = '';
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    };
    const colIndexByKey = (key: string) => ws.columns.findIndex((c: any) => c.key === key) + 1;

    function mergeAndCenter(row: number, startCol: number, endCol: number, value: string) {
      ws.mergeCells(row, startCol, row, endCol);
      const cell = ws.getCell(row, startCol);
      cell.value = value;
      cell.font = { bold: true, size: row === 1 ? 14 : 12 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    function fmtIdLong(date: string) {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }

    const lastCol = ws.columns.length;
    const name = rows?.[0]?.healthcareFacilityName;
    const facility = (healthcareFacilityId && name ? name : '').toUpperCase();

    // ------------------ Header Utama (3 Baris) ------------------
    mergeAndCenter(1, 1, lastCol, 'Pelacakan Limbah Keluar');
    mergeAndCenter(2, 1, lastCol, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    // ------------------ Header Tabel ------------------
    const headerRow = ws.addRow(ws.columns.map((c: any) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: borderThin,
        left: borderThin,
        right: borderThin,
        bottom: borderThin,
      };
    });
    ws.views = [{ state: 'frozen', ySplit: 4 }];
    ws.autoFilter = {
      from: { row: headerRow.number, column: 1 },
      to: { row: headerRow.number, column: ws.columns.length },
    };

    // ------------------ Data Rows ------------------
    const toExcelDate = (v: any) => (v ? new Date(v) : null);

    rows.forEach((item, idx) => {
      const row = ws.addRow({
        no: idx + 1,
        wasteGroupNumber: item.wasteGroupNumber || '-',
        totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
        thirdPartyName: item.thirdPartyName || '-',
        firstName: item.firstName || '-',
        vehicleNumber: item.vehicleNumber || '-',
        pickupTime: toExcelDate(item.pickupTime) || '-',
        processTime: toExcelDate(item.processTime) || '-',
        landfillTime: toExcelDate(item.landfillTime) || '-',
        recycleTime: toExcelDate(item.recycleTime) || '-',
      });

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: borderThin,
          left: borderThin,
          right: borderThin,
          bottom: borderThin,
        };
        const key = (ws.columns[colNumber - 1] as any)?.key as string;

        if (key === 'no') {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (key === 'totalWeightInKgs') {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (['pickupTime', 'processTime', 'landfillTime', 'recycleTime'].includes(key)) {
          cell.numFmt = 'yyyy-mm-dd hh:mm';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      });
    });

    // ------------------ Jika Data Kosong: Buat Baris Kosong dengan Border ------------------
    let firstDataRow = headerRow.number + 1;
    let lastDataRow = headerRow.number + rows.length;

    if (rows.length === 0) {
      const emptyRow = ws.addRow({
        no: '',
        wasteGroupNumber: '',
        totalWeightInKgs: '',
        thirdPartyName: '',
        firstName: '',
        vehicleNumber: '',
        pickupTime: '',
        processTime: '',
        landfillTime: '',
        recycleTime: '',
      });

      emptyRow.eachCell((cell) => {
        cell.border = {
          top: borderThin,
          left: borderThin,
          right: borderThin,
          bottom: borderThin,
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      lastDataRow = emptyRow.number;
    }

    // ------------------ Total Baris ------------------
    const totalRow = ws.addRow([]);
    const totalRowNum = totalRow.number;

    ws.getCell(totalRowNum, 1).value = 'TOTAL';
    ws.getCell(totalRowNum, 1).font = { bold: true };
    ws.getCell(totalRowNum, 1).alignment = { horizontal: 'left', vertical: 'middle' };

    const sumKeys = ['totalWeightInKgs'] as const;
    for (const key of sumKeys) {
      const ci = colIndexByKey(key);
      const cell = ws.getCell(totalRowNum, ci);
      if (rows.length) {
        const letter = toColLetter(ci);
        cell.value = { formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})` };
      } else {
        cell.value = 0;
      }
      cell.numFmt = '#,##0.00';
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    for (let c = 1; c <= ws.columns.length; c++) {
      ws.getCell(totalRowNum, c).border = {
        top: borderThin,
        left: borderThin,
        right: borderThin,
        bottom: borderThin,
      };
    }

    // ------------------ Output ------------------
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async getWasteExternalForExport(
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    entityId?: number,
    search?: string,
  ): Promise<Buffer> {
    const whereClauses: string[] = [];
    const replacements: any = {};

    // ---------- FILTER ----------
    if (search) {
      whereClauses.push(`wrg.group_id = :search`);
      replacements.search = search;
    }

    if (startDate && endDate) {
      whereClauses.push(
        `CONVERT_TZ(wrg.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
      );
      replacements.startDate = `${startDate} 00:00:00`;
      replacements.endDate = `${endDate} 23:59:59`;
    }

    if (entityId) {
      whereClauses.push(`wb.healthcare_facility_id = :entityId`);
      replacements.entityId = entityId;
    }

    if (provinceId) {
      whereClauses.push(`wb.province_id = :provinceId`);
      replacements.provinceId = provinceId;
    }

    if (regencyId) {
      whereClauses.push(`wb.regency_id = :regencyId`);
      replacements.regencyId = regencyId;
    }

    whereClauses.push(`wrg.transportation_status = 'IN_TRANSIT'`);
    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // ---------- QUERY ----------
    const query = `
        SELECT
            wbs.waste_bag_qr_code_id AS wasteBagQrCodeIdIn,
            wbs.wasteTypeName,
            wbs.wasteGroupName,
            wbs.wasteCharacteristicsName,
            wbs.weight_in_kgs AS weightInKgs,
            wbs.group_id,
            wbs.total_weight_in_kgs,
            wb.waste_bag_qr_code_id,
            wt.name AS wasteTypeExName,
            wg.name AS wasteGroupExName,
            wch.name AS wasteCharacteristicsExName,
            wb.weight_in_kgs,
            wrg.group_id AS wasteGroupEx,
            wrg.total_weight_in_kgs AS totalWeightInKgs,
            wb.transporter_name AS thirdPartyName,
            us.firstname AS operatorName,
            pv.vehicle_number AS vehicleNumber,
            wrg.updated_at AS pickupTime,
            CASE WHEN wc.disposal_method = 'TRANSPORTER_TREATMENT'
                THEN DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s')
                ELSE NULL END AS processTime,
            CASE WHEN wc.disposal_method = 'TRANSPORTER_LANDFILL'
                THEN DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s')
                ELSE NULL END AS landfillTime,
            CASE WHEN wc.disposal_method = 'TRANSPORTER_RECYCLER'
                THEN DATE_FORMAT(CONVERT_TZ(wrg.updated_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s')
                ELSE NULL END AS recycleTime,
            CASE WHEN wc.disposal_method = 'SPECIALIZED_TREATMENT_PROVIDER'
                THEN DATE_FORMAT(CONVERT_TZ(wrg.updated_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s')
                ELSE NULL END AS specialTime,
            CASE WHEN wc.disposal_method = 'TRANSPORTER_GOVERNMENT'
                THEN DATE_FORMAT(CONVERT_TZ(wrg.updated_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s')
                ELSE NULL END AS govermentTime,
            CASE WHEN wc.disposal_method = 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
                THEN DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s')
                ELSE NULL END AS wasteBankTime,
            wb.healthcare_facility_name AS healthcareFacilityName
        FROM waste_transportation_external_group wrg
        LEFT JOIN partner_vehicle pv ON pv.id = wrg.transporter_vehicle_id
        LEFT JOIN waste_treatment_external_group wtrg ON wtrg.group_id = wrg.group_id
        LEFT JOIN users us ON us.user_uuid = wrg.transporter_operator_id
        JOIN waste_bag wb ON wb.waste_transportation_external_group_id = wrg.id
        JOIN waste_classification wc ON wc.id = wb.waste_classification_id
        JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
        JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
        JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
        LEFT JOIN (
            SELECT
                wtg.id AS wtgId,
                wtg.total_weight_in_kgs,
                wb.id,
                waste_bag_qr_code_id,
                wt.name AS wasteTypeName,
                wg.name AS wasteGroupName,
                wch.name AS wasteCharacteristicsName,
                wb.weight_in_kgs,
                wtg.group_id
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
            JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
            JOIN waste_treatment_group wtg ON FIND_IN_SET(wtg.id, wb.waste_group_ids) > 0
            WHERE wb.waste_group_ids IS NOT NULL
        ) wbs ON wbs.id = wb.id
        LEFT JOIN waste_bag wbin ON wbin.waste_treatment_group_id = wbs.wtgId
        ${whereSQL}
    `;

    const data: any[] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // ---------- HAPUS healthcareFacilityName dari kolom cetak ----------
    const cleanedData = data.map(({ healthcareFacilityName, ...rest }) => rest);

    // ---------- EXCEL ----------
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet('Limbah Keluar');
    wb.creator = 'WMS';
    wb.created = new Date();

    const borderThin: Partial<Excel.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const mergeAndCenter = (row: number, colStart: number, colEnd: number, text: string) => {
      ws.mergeCells(row, colStart, row, colEnd);
      const cell = ws.getCell(row, colStart);
      cell.value = text;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true, size: 12 };
    };

    const fmtIdLong = (date: string) =>
      new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    if (cleanedData.length === 0) {
      ws.addRow(['Tidak ada data']);
    } else {
      const headers = [
        'No',
        'Kode Kantong Limbah',
        'Tipe Limbah',
        'Grup Limbah',
        'Karakteristik Limbah',
        'Berat Kantong Limbah',
        'Kode Group Pengolahan Internal',
        'Berat Grup Pengolahan Internal',
        'Kode Kantong Hasil Pengolahan',
        'Tipe Limbah',
        'Grup Limbah',
        'Karakteristik Limbah',
        'Berat Kantong Limbah',
        'Kode Group Pengolahan Eksternal',
        'Berat Grup Pengolahan Eksternal',
        'Pihak Ketiga',
        'Petugas Pengangkut',
        'Nomor Plat Kendaraan',
        'Waktu Diangkut',
        'Waktu Diolah',
        'Waktu Ditimbus',
        'Waktu Diangkut Pemanfaat',
        'Waktu Diangkut Pengangkut Khusus',
        'Waktu Diangkut Pengangkut Limbah Lokal',
        'Waktu Diterima Bank Sampah',
      ];

      const keys = Object.keys(cleanedData[0]);
      const lastCol = headers.length;

      const facility = (data?.[0]?.healthcareFacilityName ?? '').toUpperCase();
      mergeAndCenter(1, 1, lastCol, 'Pelacakan Limbah Keluar');
      mergeAndCenter(2, 1, lastCol, `Nama Fasilitas: ${facility || '—'}`);
      if (startDate && endDate)
        mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

      // ---------- Header ----------
      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = borderThin;
      });

      // ---------- Data ----------
      cleanedData.forEach((rowObj, index) => {
        const rowValues = [
          index + 1, // nomor urut
          ...keys.map((k) => {
            const val = rowObj[k];
            if (val === null || val === undefined || val === '') {
              return typeof cleanedData[0][k] === 'number' ? 0 : '-';
            }
            return val;
          }),
        ];

        const row = ws.addRow(rowValues);
        row.eachCell((cell) => {
          cell.border = borderThin;
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
      });

      // ---------- Total Row ----------
      const numericCols = keys
        .map((key, idx) => (typeof cleanedData[0][key] === 'number' ? idx + 2 : null)) // +2 karena ada kolom No
        .filter((v) => v !== null) as number[];

      if (numericCols.length > 0) {
        const firstDataRow = headerRow.number + 1;
        const lastDataRow = ws.lastRow!.number;
        const totalRow = ws.addRow([]);

        totalRow.getCell(1).value = 'Jumlah Total';
        totalRow.getCell(1).font = { bold: true };
        totalRow.getCell(1).alignment = { horizontal: 'right' };

        numericCols.forEach((col) => {
          totalRow.getCell(col).value = {
            formula: `SUM(${ws.getColumn(col).letter}${firstDataRow}:${ws.getColumn(col).letter}${lastDataRow})`,
          };
          totalRow.getCell(col).numFmt = '#,##0.00';
          totalRow.getCell(col).font = { bold: true };
          totalRow.getCell(col).alignment = { horizontal: 'right' };
        });

        for (let c = 1; c <= lastCol; c++) {
          const cell = totalRow.getCell(c);
          if (cell) cell.border = borderThin;
        }
      }
    }

    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  checkAllSheetWasteTrackingAll = (role: string, type: number) => {
    if (isOnlyAdmin(role) && type != 3) return false;
    return true;
  };

  async exportWasteTrackingAllSheetsExcel(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    role: string = 'admin',
    type: number = 1,
  ): Promise<Buffer> {
    const isAllTable = this.checkAllSheetWasteTrackingAll(role, type);
    const [characteristics, sources, wasteBags] = await Promise.all([
      this.fetchWasteCharacteristicsSummary(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
      ),
      !isAllTable
        ? []
        : this.fetchWasteSourceSummary(
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
          ),
      !isAllTable
        ? []
        : this.fetchWasteBags(startDate, endDate, provinceId, regencyId, healthcareFacilityId),
    ]);

    const workbook = new Excel.Workbook();
    workbook.creator = 'WMS';
    workbook.created = new Date();

    // ------------------ Shared Styles & Helpers ------------------
    const borderThin: Partial<Excel.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    const fmtIdLong = (date: string) =>
      new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    const mergeAndCenter = (
      ws: Excel.Worksheet,
      row: number,
      colStart: number,
      colEnd: number,
      value: string,
    ) => {
      ws.mergeCells(row, colStart, row, colEnd);
      const cell = ws.getCell(row, colStart);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.font = { bold: true };
    };

    const facility = (
      (healthcareFacilityId &&
        (characteristics?.[0]?.healthcareFacilityName ||
          sources?.[0]?.healthcareFacilityName ||
          wasteBags?.[0]?.healthcareFacilityName)) ||
      ''
    ).toUpperCase();

    // =====================================================================
    // SHEET 1 - Ringkasan Karakteristik Limbah
    // =====================================================================
    const ws1 = workbook.addWorksheet('Ringkasan Karakteristik Limbah');
    ws1.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'healthcareFacilityName', header: 'Fasyankes', width: 25 },
      { key: 'wasteTypeName', header: 'Jenis', width: 22 },
      { key: 'wasteGroupName', header: 'Kelompok', width: 16 },
      { key: 'wasteCharacteristicsName', header: 'Karakteristik', width: 20 },
      { key: 'wasteStatus', header: 'Tindak Lanjut', width: 20 },
      { key: 'totalWeightInKgs', header: 'Total Berat (Kg)', width: 18 },
      { key: 'avgWeightPerDay', header: 'Rata-rata berat per hari', width: 18 },
      { key: 'totalWasteBag', header: 'Jumlah kantong', width: 15 },
      {
        key: 'avgWasteBagPerDay',
        header: 'Jumlah Rata-rata kantong per hari (Kantong)',
        width: 22,
      },
    ];

    const lastCol1 = ws1.columns.length;
    mergeAndCenter(ws1, 1, 1, lastCol1, 'Ringkasan Karakteristik Limbah');
    mergeAndCenter(ws1, 2, 1, lastCol1, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(ws1, 3, 1, lastCol1, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    const headerRow1 = ws1.addRow(ws1.columns.map((c) => (c as any).header));
    headerRow1.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });
    ws1.views = [{ state: 'frozen', ySplit: 4 }];

    const startRowCharacteristics = 5;
    let mergeStartRow = startRowCharacteristics;
    let lastHealthcareFacility = '';
    characteristics.forEach((item, idx) => {
      const currentExcelRow = idx + startRowCharacteristics;
      const healthcareFacilityName =
        item.healthcareFacilityName !== lastHealthcareFacility ? item.healthcareFacilityName : '';
      const row = ws1.addRow({
        no: idx + 1,
        healthcareFacilityName,
        wasteTypeName: item.wasteTypeName,
        wasteGroupName: item.wasteGroupName,
        wasteCharacteristicsName: item.wasteCharacteristicsName,
        wasteStatus: WASTE_STATUS[item.wasteStatus] || item.wasteStatus,
        totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
        avgWeightPerDay: Number(item.avgWeightPerDay) || 0,
        totalWasteBag: Number(item.totalWasteBag) || 0,
        avgWasteBagPerDay: Number(item.avgWasteBagPerDay) || 0,
      });
      row.eachCell((cell, col) => {
        cell.border = borderThin;
        if ([7, 8, 10].includes(col)) cell.numFmt = '#,##0.00';
        if (col === 9) cell.numFmt = '#,##0';
        cell.alignment = {
          horizontal: col === 1 ? 'center' : 'right',
          vertical: 'middle',
          wrapText: true,
        };
        if ([2, 3, 4, 5, 6].includes(col))
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      });

      // merge previous group when facility changes
      if (lastHealthcareFacility && item.healthcareFacilityName !== lastHealthcareFacility) {
        const mergeEndRow = currentExcelRow - 1;

        // merge only if more than 1 row
        if (mergeStartRow < mergeEndRow) {
          ws1.mergeCells(`B${mergeStartRow}:B${mergeEndRow}`);
        }

        mergeStartRow = currentExcelRow;
      }

      lastHealthcareFacility = item.healthcareFacilityName;
    });
    // merge last group
    const lastRowCharacteristic = characteristics.length + startRowCharacteristics - 1;

    if (mergeStartRow < lastRowCharacteristic) {
      ws1.mergeCells(`B${mergeStartRow}:B${lastRowCharacteristic}`);
    }

    const firstDataRow1 = headerRow1.number + 1;
    const lastDataRow1 = ws1.lastRow?.number || headerRow1.number;
    const totalRow1 = ws1.addRow([]);
    const tr1 = totalRow1.number;
    ws1.mergeCells(tr1, 2, tr1, 6);
    ws1.getCell(tr1, 2).value = 'Jumlah';
    ws1.getCell(tr1, 2).font = { bold: true };
    ws1.getCell(tr1, 2).alignment = { horizontal: 'right', vertical: 'middle' };
    ws1.getCell(tr1, 7).value = { formula: `SUM(G${firstDataRow1}:G${lastDataRow1})` };
    ws1.getCell(tr1, 8).value = { formula: `SUM(H${firstDataRow1}:H${lastDataRow1})` };
    ws1.getCell(tr1, 9).value = { formula: `SUM(I${firstDataRow1}:I${lastDataRow1})` };
    ws1.getCell(tr1, 10).value = { formula: `SUM(J${firstDataRow1}:J${lastDataRow1})` };
    for (let c = 1; c <= lastCol1; c++) ws1.getCell(tr1, c).border = borderThin;

    if (!isAllTable) {
      const out = await workbook.xlsx.writeBuffer();
      return Buffer.from(out as ArrayBuffer);
    }

    // =====================================================================
    // SHEET 2 - Ringkasan Sumber Limbah
    // =====================================================================
    const ws2 = workbook.addWorksheet('Ringkasan per Sumber Limbah');
    ws2.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'sourceType', header: 'Tipe Sumber Limbah', width: 22 },
      { key: 'wasteSourceName', header: 'Nama Sumber Limbah', width: 30 },
      { key: 'totalWasteBag', header: 'Total Kantong Limbah', width: 15 },
      { key: 'totalWeightInKgs', header: 'Total Berat (Kg)', width: 18 },
    ];
    const lastCol2 = ws2.columns.length;
    mergeAndCenter(ws2, 1, 1, lastCol2, 'Ringkasan Sumber Limbah');
    mergeAndCenter(ws2, 2, 1, lastCol2, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(ws2, 3, 1, lastCol2, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    const headerRow2 = ws2.addRow(ws2.columns.map((c) => (c as any).header));
    headerRow2.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });
    ws2.views = [{ state: 'frozen', ySplit: 4 }];

    sources.forEach((item, idx) => {
      const row = ws2.addRow({
        no: idx + 1,
        sourceType: item.sourceType,
        wasteSourceName: item.wasteSourceName,
        totalWasteBag: Number(item.totalWasteBag) || 0,
        totalWeightInKgs: Number(item.totalWeightInKgs) || 0,
      });
      row.eachCell((cell, col) => {
        cell.border = borderThin;
        if (col >= 4) cell.numFmt = col === 5 ? '#,##0.00' : '#,##0';
        cell.alignment = { horizontal: col <= 3 ? 'center' : 'right', vertical: 'middle' };
      });
    });

    const firstDataRow2 = headerRow2.number + 1;
    const lastDataRow2 = ws2.lastRow?.number || headerRow2.number;
    const totalRow2 = ws2.addRow([]);
    const tr2 = totalRow2.number;
    ws2.mergeCells(tr2, 1, tr2, 3);
    ws2.getCell(tr2, 1).value = 'Jumlah';
    ws2.getCell(tr2, 1).alignment = { horizontal: 'right', vertical: 'middle' };
    ws2.getCell(tr2, 1).font = { bold: true };
    ws2.getCell(tr2, 4).value = { formula: `SUM(D${firstDataRow2}:D${lastDataRow2})` };
    ws2.getCell(tr2, 5).value = { formula: `SUM(E${firstDataRow2}:E${lastDataRow2})` };
    for (let c = 1; c <= lastCol2; c++) ws2.getCell(tr2, c).border = borderThin;

    // =====================================================================
    // SHEET 3 - Timbulan per Kantong Limbah
    // =====================================================================
    const ws3 = workbook.addWorksheet('Timbulan per Kantong Limbah');
    ws3.columns = [
      { key: 'no', header: 'No', width: 5 },
      { key: 'qrCode', header: 'Kode Kantong Limbah', width: 22 },
      { key: 'wasteCode', header: 'Kode Limbah', width: 16 },
      { key: 'wasteTypeName', header: 'Jenis Limbah', width: 22 },
      { key: 'wasteGroupName', header: 'Kelompok Limbah', width: 22 },
      { key: 'wasteCharacteristicsName', header: 'Karakteristik Limbah', width: 24 },
      { key: 'wasteSource', header: 'Sumber Limbah', width: 28 },
      { key: 'transporterName', header: 'Pengangkut', width: 22 },
      { key: 'thirdPartyName', header: 'Pengolah Limbah', width: 22 },
      { key: 'checkInDate', header: 'Tanggal Masuk', width: 20 },
      { key: 'storageMax', header: 'Maksimal Penyimpanan (Hari)', width: 22 },
      { key: 'weightInKgs', header: 'Berat Masuk (Kg)', width: 16 },
      { key: 'firstName', header: 'Nama Operator', width: 22 },
      { key: 'wasteStatus', header: 'Status', width: 16 },
    ];
    const lastCol3 = ws3.columns.length;
    mergeAndCenter(ws3, 1, 1, lastCol3, 'Timbulan per Kantong Limbah');
    mergeAndCenter(ws3, 2, 1, lastCol3, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(ws3, 3, 1, lastCol3, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    const headerRow3 = ws3.addRow(ws3.columns.map((c: any) => c.header));
    headerRow3.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = borderThin;
    });
    ws3.views = [{ state: 'frozen', ySplit: 4 }];
    ws3.autoFilter = {
      from: { row: headerRow3.number, column: 1 },
      to: { row: headerRow3.number, column: lastCol3 },
    };

    const toExcelDate = (v: any) => (v ? new Date(v) : null);
    const toColLetter = (n: number) => {
      let s = '';
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    };
    const colIndexByKey = (key: string) => ws3.columns.findIndex((c: any) => c.key === key) + 1;

    wasteBags.forEach((item, idx) => {
      const row = ws3.addRow({
        no: idx + 1,
        qrCode: item.qrCode,
        wasteCode: item.wasteCode || '-',
        wasteTypeName: item.wasteTypeName,
        wasteGroupName: item.wasteGroupName,
        wasteCharacteristicsName: item.wasteCharacteristicsName,
        wasteSource: item.wasteSource,
        transporterName: item.transporterName || '-',
        thirdPartyName: item.thirdPartyName || '-',
        checkInDate: toExcelDate(item.checkInDate),
        storageMax: item.storageMax != null ? Number(item.storageMax) : '-',
        weightInKgs: item.weightInKgs != null ? Number(item.weightInKgs) : 0,
        firstName: item.firstName || '-',
        wasteStatus: item.wasteStatus,
      });
      row.eachCell((cell, colNumber) => {
        cell.border = borderThin;
        const key = (ws3.columns[colNumber - 1] as any)?.key as string;
        if (key === 'no') cell.numFmt = '#,##0';
        else if (key === 'storageMax') cell.numFmt = '#,##0';
        else if (key === 'weightInKgs') cell.numFmt = '#,##0.00';
        else if (key === 'checkInDate') cell.numFmt = 'yyyy-mm-dd hh:mm';
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
    });

    const firstDataRow3 = headerRow3.number + 1;
    const lastDataRow3 = wasteBags.length
      ? headerRow3.number + wasteBags.length
      : headerRow3.number;
    const totalRow3 = ws3.addRow([]);
    const tr3 = totalRow3.number;
    ws3.getCell(tr3, 1).value = 'TOTAL';
    ws3.getCell(tr3, 1).font = { bold: true };
    ws3.getCell(tr3, 1).alignment = { horizontal: 'left', vertical: 'middle' };
    const ci = colIndexByKey('weightInKgs');
    const sumCell3 = ws3.getCell(tr3, ci);
    if (wasteBags.length) {
      const letter = toColLetter(ci);
      sumCell3.value = { formula: `SUM(${letter}${firstDataRow3}:${letter}${lastDataRow3})` };
    } else sumCell3.value = 0;
    sumCell3.numFmt = '#,##0.00';
    sumCell3.font = { bold: true };
    sumCell3.alignment = { horizontal: 'right', vertical: 'middle' };
    for (let c = 1; c <= lastCol3; c++) ws3.getCell(tr3, c).border = borderThin;

    // ------------------ Output ------------------
    const out = await workbook.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async fetchWasteCharacteristicsSummary(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<any[]> {
    const replacements: Record<string, any> = {};
    const whereSQL = buildWhereWithDate(
      'a',
      startDate,
      endDate,
      { provinceId, regencyId, healthcareFacilityId },
      replacements,
    );

    const sql = `
            WITH date_range AS (
            SELECT DATEDIFF(:endDate, :startDate) + 1 AS days_count
            )
            SELECT
              wt.name AS wasteTypeName,
              wg.name AS wasteGroupName,
              wh.name AS wasteCharacteristicsName,
	            a.waste_status AS wasteStatus,
              COUNT(a.id) AS totalWasteBag,
              SUM(a.weight_in_kgs) AS totalWeightInKgs,
              ROUND(SUM(a.weight_in_kgs) / dr.days_count, 2) AS avgWeightPerDay,
              CEIL(COUNT(a.id) / dr.days_count) AS avgWasteBagPerDay,
              a.healthcare_facility_name AS healthcareFacilityName
            FROM waste_bag a
            JOIN waste_classification wc ON wc.id = a.waste_classification_id
            JOIN waste_hierarchy wh ON wh.id = wc.waste_characteristics_id
            JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            CROSS JOIN date_range dr
            ${whereSQL}
            GROUP BY a.healthcare_facility_name, wc.waste_characteristics_id, a.waste_status
            ORDER BY a.healthcare_facility_name DESC, wt.name, wg.name, wh.name
        `;
    const rows = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return rows as any[];
  }

  async fetchWasteRecordCharacteristicsSummary(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<any[]> {
    const replacements: Record<string, any> = {};
    const whereSQL = buildWhereWithDate(
      'a',
      startDate,
      endDate,
      { provinceId, regencyId, healthcareFacilityId },
      replacements,
    );

    const sql = `
            WITH date_range AS (
            SELECT DATEDIFF(:endDate, :startDate) + 1 AS days_count
            )
            SELECT
            wt.name AS wasteTypeName,
            wg.name AS wasteGroupName,
            wh.name AS wasteCharacteristicsName,
            COUNT(a.id) AS totalWasteBag,
            SUM(a.weight_in_kgs) AS totalWeightInKgs,
            ROUND(SUM(a.weight_in_kgs) / dr.days_count, 2) AS avgWeightPerDay,
            CEIL(COUNT(a.id) / dr.days_count) AS avgWasteBagPerDay,
            a.healthcare_facility_name AS healthcareFacilityName
            FROM waste_bag_record a
            JOIN waste_classification wc ON wc.id = a.waste_classification_id
            JOIN waste_hierarchy wh ON wh.id = wc.waste_characteristics_id
            JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            CROSS JOIN date_range dr
            ${whereSQL}
            GROUP BY wc.waste_characteristics_id, wt.name, wg.name, wh.name
            ORDER BY wh.name
        `;

    const rows = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return rows as any[];
  }

  async fetchWasteSourceSummary(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<any[]> {
    const { caseWasteSourceName, caseSourceType } = buildWasteSourceLabelSQL('in');
    const replacements: Record<string, any> = {
      startDate: `${startDate} 00:00:00`,
      endDate: `${endDate} 23:59:59`,
    };
    const andSQL = buildAndClause(
      'wb',
      { provinceId, regencyId, healthcareFacilityId },
      replacements,
    );

    const sql = `
            SELECT
            ${caseWasteSourceName},
            ${caseSourceType},
            COUNT(wb.id) AS totalWasteBag,
            SUM(wb.weight_in_kgs) AS totalWeightInKgs,
            wb.healthcare_facility_name AS healthcareFacilityName
            FROM waste_bag wb
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            WHERE CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate
            ${andSQL}
            GROUP BY wb.waste_source_id, ws.source_type
            ORDER BY ws.source_type
        `;

    const rows = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return rows as any[];
  }

  async fetchWasteBags(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    search?: string,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<any[]> {
    const replacements: Record<string, any> = {
      startDate: `${startDate} 00:00:00`,
      endDate: `${endDate} 23:59:59`,
    };

    // --- Build dynamic WHERE clause ---
    const whereClauses: string[] = [
      `CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
    ];

    // Lokasi
    if (provinceId) {
      whereClauses.push('wb.province_id = :provinceId');
      replacements.provinceId = provinceId;
    }
    if (regencyId) {
      whereClauses.push('wb.regency_id = :regencyId');
      replacements.regencyId = regencyId;
    }
    if (healthcareFacilityId) {
      whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
      replacements.healthcareFacilityId = healthcareFacilityId;
    }

    // Filter tambahan
    if (wasteTypeId) {
      whereClauses.push('wcx.waste_type_id = :wasteTypeId');
      replacements.wasteTypeId = wasteTypeId;
    }
    if (wasteGroupId) {
      whereClauses.push('wcx.waste_group_id = :wasteGroupId');
      replacements.wasteGroupId = wasteGroupId;
    }
    if (wasteCharacteristicsId) {
      whereClauses.push('wcx.waste_characteristics_id = :wasteCharacteristicsId');
      replacements.wasteCharacteristicsId = wasteCharacteristicsId;
    }
    if (search) {
      whereClauses.push('wb.waste_bag_qr_code_id LIKE :search');
      replacements.search = `%${search}%`;
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // --- SQL utama ---
    const sql = `
        WITH filtered_data AS (
            SELECT
                wb.id AS id,
                CONVERT_TZ(wb.created_at, '+00:00', '+07:00') AS createdAt,
                wcx.waste_code AS wasteCode,
                wb.waste_bag_qr_code_id AS qrCode,
                wc.name AS wasteCharacteristicsName,
                ${WASTE_STATUS_LABEL.id} AS wasteStatus,
                wb.weight_in_kgs AS weightInKgs,
                wb.actual_storage_end_timestamp AS actualStorageEndDatetime,
                wb.healthcare_facility_id AS healthcareFacilityId,
                wb.waste_source_id AS wasteSourceId,
                wb.waste_classification_id AS wasteClassificationId,
                wb.transporter_id AS transporterId,
                wb.third_party_id AS thirdPartyId,
                wt.name AS wasteTypeName,
                wgh.name AS wasteGroupName,
                wb.waste_status_updated_at AS wasteStatusUpdatedAt,
                CASE
                    WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
                    WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN ws.internal_treatment_name
                    ELSE ws.external_healthcare_facility_name
                END AS wasteSource,
                p.provider_type AS wasteTreatment,
                CASE
                    WHEN wb.waste_status = 'IN_COLD_STORAGE'
                        THEN ROUND(wcx.cold_storage_max_hours / 24)
                    ELSE ROUND(wcx.temp_storage_max_hours / 24)
                END AS storageMax,
                CASE
                    WHEN wb.waste_treatment_group_id IS NOT NULL
                        AND wb.waste_transportation_external_group_id IS NULL
                        THEN wg.group_id
                    ELSE wteg.group_id
                END AS wasteGroupNumber,
                CONVERT_TZ(wb.created_at, '+00:00', '+07:00') AS checkInDate,
                CONVERT_TZ(wteg.updated_at, '+00:00', '+07:00') AS checkOutDate,
                wb.manifest_doc_number AS manifestDocNumber,
                wb.province_name AS provinceName,
                wb.regency_name AS regencyName,
                wb.healthcare_facility_name AS healthcareFacilityName,
                wb.transporter_name AS transporterName,
                wb.third_party_name AS thirdPartyName,
                wb.district_name AS districtName,
                wcx.disposal_method AS disposalMethod,
                wc.name_en AS wasteCharacteristicsNameEn,
                wt.name_en AS wasteTypeNameEn,
                wgh.name_en AS wasteGroupNameEn,
                u.firstname AS firstName
            FROM waste_bag wb
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            JOIN waste_classification wcx ON wcx.id = wb.waste_classification_id
            JOIN waste_hierarchy wc ON wc.id = wcx.waste_characteristics_id
            JOIN waste_hierarchy wt ON wt.id = wcx.waste_type_id
            JOIN waste_hierarchy wgh ON wgh.id = wcx.waste_group_id
            LEFT JOIN waste_treatment_group wg ON wg.id = wb.waste_treatment_group_id
            LEFT JOIN waste_transportation_external_group wteg
                ON wteg.id = wb.waste_transportation_external_group_id
                AND wteg.transportation_status = 'IN_TRANSIT'
            LEFT JOIN waste_treatment_external_group wtrg
                ON wtrg.id = wb.waste_treatment_external_group_id
            LEFT JOIN partnership p
                ON p.provider_id = wb.transporter_id
                AND p.transporter_id IS NULL
                AND wcx.id = p.waste_classification_id
                AND p.consumer_id = wb.healthcare_facility_id
                AND p.partnership_status = 'ACTIVE'
            LEFT JOIN users u ON u.user_uuid = wb.created_by
            ${whereSQL}
        )
        SELECT * FROM filtered_data
        ORDER BY createdAt ASC
    `;

    const rows = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return rows as any[];
  }
}

function buildWhereWithDate(
  alias: string,
  startDate: string,
  endDate: string,
  filters: Filters,
  replacements: Record<string, any>,
): string {
  const conds: string[] = [
    `CONVERT_TZ(${alias}.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
  ];
  replacements.startDate = `${startDate} 00:00:00`;
  replacements.endDate = `${endDate} 23:59:59`;

  if (filters.provinceId) {
    conds.push(`${alias}.province_id = :provinceId`);
    replacements.provinceId = filters.provinceId;
  }
  if (filters.regencyId) {
    conds.push(`${alias}.regency_id = :regencyId`);
    replacements.regencyId = filters.regencyId;
  }
  if (filters.healthcareFacilityId) {
    conds.push(`${alias}.healthcare_facility_id = :healthcareFacilityId`);
    replacements.healthcareFacilityId = filters.healthcareFacilityId;
  }
  return `WHERE ${conds.join(' AND ')}`;
}

function buildAndClause(
  alias: string,
  filters: Filters,
  replacements: Record<string, any>,
): string {
  const conds: string[] = [];
  if (filters.provinceId) {
    conds.push(`${alias}.province_id = :provinceId`);
    replacements.provinceId = filters.provinceId;
  }
  if (filters.regencyId) {
    conds.push(`${alias}.regency_id = :regencyId`);
    replacements.regencyId = filters.regencyId;
  }
  if (filters.healthcareFacilityId) {
    conds.push(`${alias}.healthcare_facility_id = :healthcareFacilityId`);
    replacements.healthcareFacilityId = filters.healthcareFacilityId;
  }
  return conds.length ? `AND ${conds.join(' AND ')}` : '';
}

type Filters = {
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
};
