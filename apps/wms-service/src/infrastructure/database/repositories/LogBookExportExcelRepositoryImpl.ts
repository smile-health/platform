import * as Excel from 'exceljs';
import LogBookExcelRepository from '../../../domain/repositories/LogBookExportExcelRepository';
import { sequelize } from '../db.connection';
import { QueryTypes } from 'sequelize';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import EntitiesModel from '../models/EntitiesModel';
import { buildWasteSourceLabelSQL } from '../../../shared/utils/buildWasteSourceLabelSQL';

export default class LogBookExportExcelRepositoryImpl implements LogBookExcelRepository {
  async getWasteBagLogBookForExportExcel(
    startDate: string,
    endDate: string,
    healthcareFacilityId: number,
    provinceId?: number,
    regencyId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<Buffer> {
    const data = await this.getWasteBagLogBook(
      startDate,
      endDate,
      healthcareFacilityId,
      provinceId,
      regencyId,
      wasteTypeId,
      wasteGroupId,
      wasteCharacteristicsId,
    );

    const entities = await EntitiesModel.findOne({
      where: {
        id: healthcareFacilityId,
      },
    });

    // ------------------ Excel ------------------
    const wb = new Excel.Workbook();
    wb.creator = 'WMS';
    wb.created = new Date();
    const ws = wb.addWorksheet('LogBook', {
      headerFooter: { firstHeader: 'LogBook', firstFooter: 'WMS' },
    });

    ws.columns = [
      { key: 'no', header: '', width: 5 }, // A
      { key: 'jenis', header: '', width: 22 }, // B
      { key: 'karakteristik', header: '', width: 16 }, // C
      { key: 'kodeGrup', header: '', width: 16 }, // D
      { key: 'kodePP', header: '', width: 20 }, // E
      { key: 'qrCode', header: '', width: 18 }, // F
      { key: 'tglMasuk', header: '', width: 18 }, // G
      { key: 'sumber', header: '', width: 14 }, // H
      { key: 'jmlMasuk', header: '', width: 16 }, // I
      { key: 'maksSimpan', header: '', width: 22 }, // J
      { key: 'tglKeluar', header: '', width: 18 }, // K
      { key: 'jmlKeluar', header: '', width: 16 }, // L
      { key: 'tujuan', header: '', width: 22 }, // M
      { key: 'manifest', header: '', width: 18 }, // N
      { key: 'tglLimbah', header: '', width: 18 }, // O
      { key: 'jmlLimbah', header: '', width: 16 }, // P
    ];
    const lastCol = ws.columnCount;

    // Helpers
    const fmtIdLong = (iso?: string | Date | null) => {
      if (!iso) return '';
      const d = iso instanceof Date ? iso : new Date(`${iso}T00:00:00`);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    };
    const toDate = (v: any): Date | null => (v ? new Date(v) : null);
    const borderThin = { style: 'thin' as const, color: { argb: 'FF000000' } };

    const mergeAndCenter = (row: number, fromCol: number, toCol: number, value: string) => {
      ws.mergeCells(row, fromCol, row, toCol);
      const cell = ws.getCell(row, fromCol);
      cell.value = value;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    };

    // ---- Judul 3 baris
    const facility = (entities?.dataValues.name ?? '').toUpperCase();
    mergeAndCenter(1, 1, lastCol, `LEMBAR PENGELOLAAN LIMBAH BAHAN BERBAHAYA DAN BERACUN (B3)`);
    mergeAndCenter(2, 1, lastCol, `Nama Usaha / Kegiatan : ${facility || '—'}`);
    mergeAndCenter(3, 1, lastCol, `${fmtIdLong(startDate)} - ${fmtIdLong(endDate)}`);

    mergeAndCenter(4, 1, 10, 'MASUKNYA LIMBAH KE TPS');
    ws.mergeCells(4, 11, 4, 14);
    ws.getCell(4, 11).value = 'KELUARNYA LIMBAH DARI TPS'; // K..N
    ws.mergeCells(4, 15, 4, 16);
    ws.getCell(4, 15).value = 'SISA LIMBAH'; // O..P
    [6, 11, 15].forEach((c) => {
      const cell = ws.getCell(4, c);
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Baris 5: header kolom A..P
    const h5 = [
      'No.',
      'Jenis Limbah Masuk',
      'Karakteristik',
      'Kode Grup Limbah',
      'Kode Limbah sesuai PP 22/2021',
      'Nomor kantong limbah',
      'Tanggal masuk Limbah',
      'Sumber Limbah [1]',
      'Jumlah Limbah Masuk (kg)',
      'Maksimal penyimpanan s/d tanggal [2]',
      'Tanggal keluar Limbah',
      'Jumlah Limbah (kg)',
      'Tujuan Penyerahan',
      'Nomor Manifest [3]',
      'Tanggal',
      'Jumlah Limbah (kg)',
    ];
    const row5 = ws.addRow(h5);
    row5.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    row5.height = 28;

    // Baris 6: subheader (A) .. (P)
    const sub = Array.from({ length: 16 }, (_, i) => `(${String.fromCharCode(65 + i)})`);
    const row6 = ws.addRow(sub);
    row6.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Border header (rows 4..6, cols 1..16)
    for (let r = 4; r <= 6; r++) {
      for (let c = 1; c <= 16; c++) {
        const cell = ws.getCell(r, c);
        cell.border = {
          top: borderThin,
          left: borderThin,
          right: borderThin,
          bottom: borderThin,
        };
      }
    }

    // Freeze sampai baris 6 dan kolom A
    ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 6 }];

    // ---- Data rows (mulai baris 7)
    const startDataRow = 7;

    data.forEach((item, idx) => {
      const checkInDate = toDate(item.checkInDate);
      const checkOutDate = toDate(item.checkOutDate);
      const createdAt = toDate(item.createdAt);
      const maksSimpan =
        createdAt && item.storageMax
          ? new Date(createdAt.getTime() + Number(item.storageMax) * 86400000)
          : null;

      // Isi sesuai kolom A..P
      const values = [
        idx + 1, // A No.
        item.wasteTypeName || item.wasteGroupName || '-', // B Jenis Limbah Masuk (silakan sesuaikan bila perlu)
        item.wasteCharacteristicsName || '-', // C
        item.wasteGroupNumber || '-', // D
        item.wasteCode || '-', // E
        item.qrCode || '-', // F
        fmtIdLong(checkInDate), // G (teks Indonesia)
        item.wasteSourceName || '-', // H
        Number(item.weightInKgs ?? 0), // I
        fmtIdLong(maksSimpan), // J
        fmtIdLong(checkOutDate) || '-', // K
        Number(item.weightOutKgs ?? 0), // L
        item.thirdPartyName || '-', // M
        item.manifestDocNumber || '-', // N
        fmtIdLong(checkOutDate) || fmtIdLong(checkInDate) || '-', // O
        Number((item.weightInKgs ?? 0) - (item.weightOutKgs ?? 0)), // P
      ];

      const row = ws.addRow(values);
      // Number formats
      row.getCell(9).numFmt = '#,##0.000'; // I
      row.getCell(12).numFmt = '#,##0.000'; // L
      row.getCell(16).numFmt = '#,##0.000'; // P

      // Align center untuk beberapa kolom
      [1, 4, 5, 6, 7, 9, 10, 11, 12, 16].forEach(
        (c) =>
          (row.getCell(c).alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          }),
      );

      // Border tiap sel data
      for (let c = 1; c <= 16; c++) {
        row.getCell(c).border = {
          top: borderThin,
          left: borderThin,
          right: borderThin,
          bottom: borderThin,
        };
      }
    });
    // ---- Row total (setelah data)
    const lastDataRow = startDataRow + Math.max(data.length - 1, 0);
    const totalRow = ws.addRow(new Array(16).fill(''));
    const totalRowNum = totalRow.number;
    ws.mergeCells(totalRowNum, 1, totalRowNum, 8); // A..H = "Jumlah"
    ws.getCell(totalRowNum, 1).value = 'Jumlah';
    ws.getCell(totalRowNum, 1).alignment = { horizontal: 'right', vertical: 'middle' };
    const sumStart = startDataRow,
      sumEnd = lastDataRow;
    if (sumEnd >= sumStart) {
      ws.getCell(totalRowNum, 9).value = { formula: `SUM(I${sumStart}:I${sumEnd})` }; // I
      ws.getCell(totalRowNum, 12).value = { formula: `SUM(L${sumStart}:L${sumEnd})` }; // L
      ws.getCell(totalRowNum, 16).value = { formula: `SUM(P${sumStart}:P${sumEnd})` }; // P
    }
    [9, 12, 16].forEach((c) => {
      ws.getCell(totalRowNum, c).numFmt = '#,##0.000';
      ws.getCell(totalRowNum, c).alignment = { horizontal: 'center' };
    });
    for (let c = 1; c <= 16; c++)
      ws.getCell(totalRowNum, c).border = {
        top: borderThin,
        left: borderThin,
        right: borderThin,
        bottom: borderThin,
      };

    // ---- Keterangan + area paraf
    ws.addRow([]); // spacer
    const ketStart = ws.lastRow!.number + 1;

    // "Keterangan :" kiri (merge A..M)
    ws.mergeCells(ketStart, 1, ketStart, 13);
    ws.getCell(ketStart, 1).value = 'Keterangan :';
    ws.getCell(ketStart, 1).font = { bold: true };

    // Teks keterangan
    const notes = [
      '[1] Sumber kegiatan yang menghasilkan limbah. Misal dari kegiatan sendiri berasal dari ruang operasi, ruang bedah, dsb.',
      '[2] Batas waktu maksimal penyimpanan di TPS, misal untuk limbah infeksius maksimal 2x24 jam untuk suhu lebih dari 2°C, sesuai rekomendasi.',
      '[3] Dokumen dapat berupa: manifest, atau dokumen internal perusahaan yang diserahkan dari bagian lain.',
      '[4] Setiap lembar harap diparaf oleh Petugas yang bertanggung jawab.',
    ];
    notes.forEach((t, i) => {
      const r = ws.addRow([t]);
      ws.mergeCells(r.number, 1, r.number, 13);
      ws.getCell(r.number, 1).alignment = { wrapText: true };
    });

    // Area tanggal & paraf di kanan (N..P)
    const areaTop = ketStart;
    ws.mergeCells(areaTop, 14, areaTop, 16); // N..P
    ws.getCell(areaTop, 14).value = `.................., ${new Date().getFullYear()}`;
    ws.getCell(areaTop, 14).alignment = { horizontal: 'right' };

    const parafRow = ws.addRow([]);
    ws.mergeCells(parafRow.number, 14, parafRow.number, 16);
    ws.getCell(parafRow.number, 14).value = 'Paraf Petugas [4]';
    ws.getCell(parafRow.number, 14).alignment = { horizontal: 'right' };

    // Page setup (opsional)
    ws.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    }; // A4

    // Buffer out
    const out = await wb.xlsx.writeBuffer();
    return Buffer.from(out as ArrayBuffer);
  }

  async getWasteBagLogBookForExportPdf(
    startDate: string,
    endDate: string,
    healthcareFacilityId: number,
    provinceId?: number,
    regencyId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<Buffer> {
    const data = await this.getWasteBagLogBook(
      startDate,
      endDate,
      healthcareFacilityId,
      provinceId,
      regencyId,
      wasteTypeId,
      wasteGroupId,
      wasteCharacteristicsId,
    );

    // ---------------------------------------------------------
    // PDF FONT SETTINGS
    // ---------------------------------------------------------
    const fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique',
      },
    };
    const printer = new PdfPrinter(fonts);

    // INDONESIAN DATE FORMAT
    const fmtId = (v?: Date | string | null) => {
      if (!v) return '-';
      const d = v instanceof Date ? v : new Date(v);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    };

    // ---------------------------------------------------------
    // COLUMN WIDTHS (kamu punya)
    // ---------------------------------------------------------
    const columnWidths = [20, 60, 60, 50, 40, 50, 65, 60, 40, 65, 65, 40, 65, 50, 65, 40];

    // ---------------------------------------------------------
    // TABLE HEADERS (AUTO WRAP)
    // ---------------------------------------------------------
    const headers = [
      'No.',
      'Jenis Limbah Masuk',
      'Karakteristik',
      'Grup Limbah',
      'PP 22/2021',
      'No Kantong',
      'Tgl Masuk',
      'Sumber Limbah [1]',
      'JML Masuk (kg)',
      'Maks Simpan [2]',
      'Tgl Keluar',
      'JML Keluar (kg)',
      'Tujuan',
      'No. Manifest [3]',
      'Tanggal',
      'JML Limbah (kg)',
    ];

    const body: any[] = [
      headers.map((h) => ({
        text: h,
        bold: true,
        alignment: 'center',
        fontSize: 8,
        noWrap: false, // WAJIB: agar header panjang tidak kepotong
      })),
    ];

    // ---------------------------------------------------------
    // TABLE DATA ROWS
    // ---------------------------------------------------------
    data.forEach((row, i) => {
      body.push([
        { text: i + 1, alignment: 'center' },
        {
          text: row.wasteTypeName || row.wasteGroupName || '',
          alignment: 'left',
          noWrap: false,
        },
        { text: row.wasteCharacteristicsName || '', alignment: 'left', noWrap: false },
        { text: row.wasteGroupNumber || '', alignment: 'center', noWrap: false },
        { text: row.wasteCode || '', alignment: 'center', noWrap: false },
        { text: row.qrCode || '', alignment: 'center', noWrap: false },
        { text: fmtId(row.checkInDate), alignment: 'center', noWrap: false },
        { text: row.wasteSourceName || '', alignment: 'left', noWrap: false },
        { text: row.weightInKgs ?? 0, alignment: 'right' },
        {
          text:
            row.createdAt && row.storageMax
              ? fmtId(
                  new Date(new Date(row.createdAt).getTime() + Number(row.storageMax) * 86400000),
                )
              : '-',
          alignment: 'center',
          noWrap: false,
        },
        { text: fmtId(row.checkOutDate), alignment: 'center', noWrap: false },
        { text: row.weightOutKgs ?? 0, alignment: 'right' },
        { text: row.thirdPartyName || '', alignment: 'left', noWrap: false },
        { text: row.manifestDocNumber || '', alignment: 'center', noWrap: false },
        { text: fmtId(endDate), alignment: 'center', noWrap: false },
        {
          text: (row.weightInKgs ?? 0) - (row.weightOutKgs ?? 0),
          alignment: 'right',
        },
      ]);
    });

    // ---------------------------------------------------------
    // NOTES
    // ---------------------------------------------------------
    const notes = [
      '[1] Sumber kegiatan yang menghasilkan limbah.',
      '[2] Batas waktu maksimal penyimpanan di TPS.',
      '[3] Dokumen dapat berupa manifest atau dokumen internal.',
      '[4] Setiap lembar harap diparaf petugas.',
    ];

    // ---------------------------------------------------------
    // DOCUMENT DEFINITION (LEGAL LANDSCAPE)
    // ---------------------------------------------------------
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LEGAL',
      pageOrientation: 'landscape',

      // margin dipersempit agar tabel lebih luas
      pageMargins: [10, 20, 10, 20],

      defaultStyle: { font: 'Courier', fontSize: 9 },

      content: [
        { text: 'LEMBAR PENGELOLAAN LIMBAH B3', style: 'header' },

        {
          text: `Nama Usaha/Kegiatan: ${(data?.[0]?.healthcareFacilityName ?? '').toUpperCase()}`,
          margin: [0, 5, 0, 5],
          fontSize: 10,
        },

        { text: `${fmtId(startDate)} - ${fmtId(endDate)}`, margin: [0, 0, 0, 15] },

        {
          table: {
            headerRows: 1,
            widths: columnWidths,
            body,
            keepWithHeaderRows: 1,
            dontBreakRows: true,
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => 3,
            paddingRight: () => 3,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },

        { text: 'Keterangan :', bold: true, margin: [0, 20, 0, 5] },

        {
          stack: notes.map((n) => ({ text: n, margin: [0, 2, 0, 2] })),
          margin: [0, 5, 0, 10],
        },

        {
          text: `.................., ${new Date().getFullYear()}`,
          alignment: 'right',
          margin: [0, 40, 0, 5],
        },
        { text: 'Paraf Petugas [4]', alignment: 'right' },
      ],

      styles: {
        header: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
      },
    };

    // ---------------------------------------------------------
    // GENERATE PDF
    // ---------------------------------------------------------
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve) => {
      pdfDoc.on('data', (c) => chunks.push(c));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    });
  }

  async getWasteBagLogBook(
    startDate: string,
    endDate: string,
    healthcareFacilityId: number,
    provinceId?: number,
    regencyId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<Array<Record<string, any>>> {
    const whereClauses: string[] = [];
    const replacements: Record<string, any> = {};
    const { caseWasteSourceName, caseSourceType } = buildWasteSourceLabelSQL('in');
    // Filter tanggal
    if (startDate) {
      whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') >= :startDate`);
      replacements.startDate = `${startDate} 00:00:00`;
    }

    if (endDate) {
      whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') <= :endDate`);
      replacements.endDate = `${endDate} 23:59:59`;
    }

    // Filter fasilitas kesehatan (wajib)
    if (healthcareFacilityId) {
      whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
      replacements.healthcareFacilityId = healthcareFacilityId;
    }

    // Filter provinsi
    if (provinceId) {
      whereClauses.push('wb.province_id = :provinceId');
      replacements.provinceId = provinceId;
    }

    // Filter kabupaten/kota
    if (regencyId) {
      whereClauses.push('wb.regency_id = :regencyId');
      replacements.regencyId = regencyId;
    }

    // Filter jenis limbah (Waste Type)
    if (wasteTypeId) {
      whereClauses.push('wcx.waste_type_id = :wasteTypeId');
      replacements.wasteTypeId = wasteTypeId;
    }

    // Filter kelompok limbah (Waste Group)
    if (wasteGroupId) {
      whereClauses.push('wcx.waste_group_id = :wasteGroupId');
      replacements.wasteGroupId = wasteGroupId;
    }

    // Filter karakteristik limbah (Waste Characteristics)
    if (wasteCharacteristicsId) {
      whereClauses.push('wcx.waste_characteristics_id = :wasteCharacteristicsId');
      replacements.wasteCharacteristicsId = wasteCharacteristicsId;
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
        SELECT
            ${caseWasteSourceName},
            ${caseSourceType},
            wb.id,
            CONVERT_TZ(wb.created_at, '+00:00', '+07:00') "createdAt",
            wcx.waste_code "wasteCode",
            wb.waste_bag_qr_code_id "qrCode",
            wc.name AS "wasteCharacteristicsName",
            wb.weight_in_kgs "weightInKgs",
            wt.name "wasteTypeName",
            wgh.name "wasteGroupName",
            wb.third_party_name AS thirdPartyName,
            ROUND(wcx.temp_storage_max_hours / 24) "storageMax",
            wteg.group_id AS "wasteGroupNumber",
            CONVERT_TZ(wb.created_at, '+00:00', '+07:00') "checkInDate",
            CONVERT_TZ(wteg.updated_at, '+00:00', '+07:00') "checkOutDate",
            CASE
                WHEN wteg.id IS NOT NULL THEN wb.weight_in_kgs
                WHEN waste_treatment_group_id IS NOT NULL THEN wb.weight_in_kgs
                ELSE 0
            END "weightOutKgs",
            wb.manifest_doc_number "manifestDocNumber",
            wb.healthcare_facility_name "healthcareFacilityName"
        FROM waste_bag wb
        JOIN waste_source ws ON ws.id = wb.waste_source_id
        JOIN waste_classification wcx ON wcx.id = wb.waste_classification_id
        JOIN waste_hierarchy wc ON wc.id = wcx.waste_characteristics_id
        JOIN waste_hierarchy wt ON wt.id = wcx.waste_type_id
        JOIN waste_hierarchy wgh ON wgh.id = wcx.waste_group_id
        LEFT JOIN waste_transportation_external_group wteg 
            ON wteg.id = wb.waste_transportation_external_group_id
            AND wteg.transportation_status != "READY_FOR_TRANSPORT"
        LEFT JOIN waste_treatment_external_group wtrg 
            ON wtrg.id = wb.waste_treatment_external_group_id
        ${whereSQL}
        ORDER BY wb.created_at DESC
    `;

    return (await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    })) as Array<Record<string, any>>;
  }
}
