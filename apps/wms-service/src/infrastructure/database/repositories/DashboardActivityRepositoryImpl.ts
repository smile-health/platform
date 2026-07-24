import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import { paginationUtils } from '../../../shared/utils/pagination';
import { sequelize } from '../db.connection';
import { QueryTypes } from 'sequelize';
import DashboardActivityRepository from '../../../domain/repositories/DashboardActivityRepository';
import ExcelJS from 'exceljs';

export default class DashboardActivityRepositoryImpl implements DashboardActivityRepository {
  async getActivitySummariesForEntities(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
    typeOfProcessing?: string,
  ): Promise<{
    data: DashboardWasteHierarchy[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      // Sanitasi pagination
      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });

      // 🔹 Bangun query lewat fungsi terpisah
      const { mainSql, countSql, replacements } = await this.buildActivitySummariesQuery(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        wasteTypeId,
        wasteGroupId,
        entityTag,
        typeOfProcessing,
        limit,
        page,
      );

      // 🔹 Eksekusi query
      const data = await sequelize.query(mainSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const [{ total = 0 }] = (await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      return {
        data: data as DashboardWasteHierarchy[],
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getActivitySummariesForEntities:', error);
      throw new Error('Database error');
    }
  }

  async getActivityManualScaleForEntities(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
  ): Promise<{
    data: DashboardWasteHierarchy[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });

      const { mainSql, countSql } = await this.buildActivityManualScaleQuery(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        wasteTypeId,
        wasteGroupId,
        entityTag,
        limit,
        page,
      );

      const data = await sequelize.query(mainSql, { type: QueryTypes.SELECT });
      const [{ total = 0 }] = (await sequelize.query(countSql, {
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      return {
        data: data as DashboardWasteHierarchy[],
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getActivityManualScaleForEntities:', error);
      throw new Error('Database error');
    }
  }

  async getUserActivitySummary(
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
    typeOfProcessing?: string,
  ): Promise<{
    totalEntities: number;
    activeEntities: number;
    inactiveEntities: number;
  }> {
    try {
      const replacements: Record<string, any> = {};

      // --- Filter untuk tabel entities ---
      const whereEntity: string[] = ['e.type in (1,2,3,4,5)'];

      if (provinceId) {
        whereEntity.push('e.province_id = :provinceId');
        replacements.provinceId = provinceId;
      }
      if (regencyId) {
        whereEntity.push('e.regency_id = :regencyId');
        replacements.regencyId = regencyId;
      }
      if (healthcareFacilityId) {
        whereEntity.push('e.id = :healthcareFacilityId');
        replacements.healthcareFacilityId = healthcareFacilityId;
      }

      const whereSQL = whereEntity.length ? `WHERE ${whereEntity.join(' AND ')}` : '';

      // --- Filter tambahan untuk subquery waste_bag ---
      const whereWasteBag: string[] = [];
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const startMonth = new Date(year, month, 1).toLocaleDateString('en-CA');
      const endMonth = new Date(year, month + 1, 0).toLocaleDateString('en-CA');

      const finalStartDate = startDate && endDate ? startDate : startMonth;
      const finalEndDate = startDate && endDate ? endDate : endMonth;

      if (startDate) {
        whereWasteBag.push(`wb.created_at >= :startDate`);
        replacements.startDate = `${finalStartDate} 00:00:00`;
      }

      if (endDate) {
        whereWasteBag.push(`wb.created_at <= :endDate`);
        replacements.endDate = `${finalEndDate} 23:59:59`;
      }

      if (wasteTypeId) {
        whereWasteBag.push('wc.waste_type_id = :wasteTypeId');
        replacements.wasteTypeId = wasteTypeId;
      }
      if (wasteGroupId) {
        whereWasteBag.push('wc.waste_group_id = :wasteGroupId');
        replacements.wasteGroupId = wasteGroupId;
      }

      if (entityTag) {
        const cleaned = entityTag
          .split(',')
          .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
          .join(', ');

        whereWasteBag.push(`et.tag IN (${cleaned})`);
        replacements.cleaned = cleaned;
      }

      const whereWasteBagSQL =
        whereWasteBag.length > 0 ? `WHERE ${whereWasteBag.join(' AND ')}` : '';

      let sql = `
        SELECT 
          COUNT(e.id) AS totalEntities,
          SUM(CASE WHEN wb.healthcare_facility_id IS NOT NULL THEN 1 ELSE 0 END) AS activeEntities,
          SUM(CASE WHEN wb.healthcare_facility_id IS NULL THEN 1 ELSE 0 END) AS inactiveEntities
        FROM entities e
        LEFT JOIN (
          SELECT DISTINCT wb.healthcare_facility_id
          FROM waste_bag wb
          JOIN waste_classification wc ON wc.id = wb.waste_classification_id
          LEFT JOIN entities et on et.id = wb.healthcare_facility_id
          ${whereWasteBagSQL}
        ) wb ON wb.healthcare_facility_id = e.id
        ${whereSQL};
      `;

      if (typeOfProcessing) {
        const select: string[] = [' COUNT(*) totalEntities'];
        if (typeOfProcessing === 'IN') {
          select.push(
            `SUM(wb.hasTreatmentGroup) activeEntities, COUNT(*) - SUM(wb.hasTreatmentGroup) inactiveEntities`,
          );
        } else {
          select.push(
            `SUM(wb.hasTransportationGroup) activeEntities, COUNT(*) - SUM(wb.hasTransportationGroup) inactiveEntities`,
          );
        }

        const selectSQL = select.length ? `SELECT ${select.join(' , ')}` : '';

        sql = `${selectSQL} 
            FROM entities e
            JOIN (
            SELECT 
              wb.healthcare_facility_id,
              CASE 
                  WHEN SUM(CASE WHEN wb.waste_treatment_group_id IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 1 
                  ELSE 0 
              END AS hasTreatmentGroup,
              CASE 
                  WHEN SUM(CASE WHEN wb.waste_transportation_external_group_id IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 1 
                  ELSE 0 
              END AS hasTransportationGroup
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
            ${whereWasteBagSQL}
            GROUP BY wb.healthcare_facility_id) wb ON wb.healthcare_facility_id = e.id
            ${whereSQL};
        `;
      }

      const result = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const row = result[0] as any;

      return {
        totalEntities: Number(row?.totalEntities ?? 0),
        activeEntities: Number(row?.activeEntities ?? 0),
        inactiveEntities: Number(row?.inactiveEntities ?? 0),
      };
    } catch (error) {
      console.error('Error in getUserActivitySummary:', error);
      throw error;
    }
  }

  async getActivitySummariesForEntitiesExport(
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
    typeOfProcessing?: string,
  ): Promise<Buffer> {
    try {
      const { mainSql, replacements, dates } = await this.buildActivitySummariesQuery(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        wasteTypeId,
        wasteGroupId,
        entityTag,
        typeOfProcessing,
        99999,
        1,
      );

      const { mainSql: mainSqlManualScale } = await this.buildActivityManualScaleQuery(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        wasteTypeId,
        wasteGroupId,
        entityTag,
        99999,
        1,
      );

      // === Eksekusi kedua query
      const rows = await sequelize.query(mainSql, {
        replacements,
        type: QueryTypes.SELECT,
      });
      const rowsManualScale = await sequelize.query(mainSqlManualScale, {
        type: QueryTypes.SELECT,
      });

      // === Map manual scale
      const manualScaleMap = new Map<number, any>();
      rowsManualScale.forEach((ms: any) => manualScaleMap.set(ms.healthcareFacilityId, ms));

      // === Setup workbook
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Activity Summary');
      wb.creator = 'WMS';
      wb.created = new Date();

      // === Hitung bulan & tahun otomatis
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : start;
      const monthName = start.toLocaleString('id-ID', { month: 'long' });
      const year = start.getFullYear();
      const headerMonthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

      // 🔹 Total hari dalam periode
      const totalDaysInRange =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // === Header
      const dayHeaders = dates.map((d) => d.dayNum.toString());
      const staticHeaders = ['No', 'Provinsi', 'Kabupaten/Kota', 'Fasyankes'];
      const summaryHeaders = [
        'Jumlah Hari Aktif',
        'Jumlah Hari Tidak Aktif',
        'Jumlah Hari Manual Scale',
        'Jumlah Frekuensi',
        'Rata-rata Frekuensi',
      ];

      // === Header bulan
      ws.addRow([]);
      ws.addRow([...staticHeaders, ...dayHeaders, ...summaryHeaders]);

      const startDayCol = staticHeaders.length + 1;
      const endDayCol = staticHeaders.length + dayHeaders.length;

      // === Merge header bulan
      ws.mergeCells(1, startDayCol, 1, endDayCol);
      const headerCell = ws.getCell(1, startDayCol);
      headerCell.value = headerMonthYear;
      headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      headerCell.font = { bold: true, size: 12 };

      // === Merge header kolom tetap
      for (let i = 1; i <= staticHeaders.length; i++) {
        ws.mergeCells(1, i, 2, i);
        const cell = ws.getCell(1, i);
        cell.value = staticHeaders[i - 1];
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true };
      }

      // === Merge summary header
      const afterDaysStart = endDayCol + 1;
      summaryHeaders.forEach((title, idx) => {
        const colIndex = afterDaysStart + idx;
        ws.mergeCells(1, colIndex, 2, colIndex);
        const c = ws.getCell(1, colIndex);
        c.value = title;
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.font = { bold: true };
      });

      // === Styling Header
      const headerColor = '4472C4';
      for (let i = 1; i <= ws.columnCount; i++) {
        const c1 = ws.getCell(1, i);
        const c2 = ws.getCell(2, i);
        [c1, c2].forEach((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: headerColor },
          };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      }

      ws.getRow(1).height = 20;
      ws.getRow(2).height = 22;

      // === Data Rows
      rows.forEach((row: any, index: number) => {
        const manualScale = manualScaleMap.get(row.healthcareFacilityId);

        // Hitung nilai-nilai
        const valuesPerDay = dayHeaders.map((d) => Number(row[d] ?? 0));
        const jumlahHariAktif = valuesPerDay.filter((v) => v > 0).length;
        const jumlahHariTidakAktif = dayHeaders.length - jumlahHariAktif;
        const jumlahHariManualScale = manualScale
          ? dayHeaders.filter((d) => Number(manualScale[d] ?? 0) === 1).length
          : 0;

        const jumlahFrekuensi = valuesPerDay.reduce((a, b) => a + b, 0);
        const rataRataFrekuensi = totalDaysInRange > 0 ? jumlahFrekuensi / totalDaysInRange : 0;

        // Tambahkan ke worksheet
        const excelRow = ws.addRow([
          index + 1,
          row.provinceName ?? '-',
          row.regencyName ?? '-',
          row.healthcareFacilityName ?? '-',
          ...valuesPerDay,
          jumlahHariAktif,
          jumlahHariTidakAktif,
          jumlahHariManualScale,
          jumlahFrekuensi,
          Math.round(rataRataFrekuensi * 100) / 100,
        ]);

        // === Pewarnaan merah untuk manual scale = 1
        dayHeaders.forEach((day, i) => {
          if (manualScale && manualScale[day] == 1) {
            const cell = excelRow.getCell(staticHeaders.length + i + 1);
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' },
            };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });

        // === Alignment kolom
        excelRow.getCell(1).alignment = { horizontal: 'center' }; // No
        excelRow.getCell(2).alignment = { horizontal: 'left' }; // Provinsi
        excelRow.getCell(3).alignment = { horizontal: 'left' }; // Kabupaten
        excelRow.getCell(4).alignment = { horizontal: 'left' }; // Entitas

        // Tanggal (tengah)
        for (let i = 0; i < dayHeaders.length; i++) {
          excelRow.getCell(staticHeaders.length + i + 1).alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }

        // Summary (kanan)
        for (let i = 0; i < summaryHeaders.length; i++) {
          excelRow.getCell(afterDaysStart + i).alignment = {
            horizontal: 'right',
            vertical: 'middle',
          };
        }
      });

      // === Border semua cell
      ws.eachRow({ includeEmpty: true }, (row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
          };
        });
      });

      // === Auto width aman
      for (let i = 1; i <= ws.columnCount; i++) {
        const col = ws.getColumn(i);
        let maxLength = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const text = cell.value ? String(cell.value) : '';
          maxLength = Math.max(maxLength, text.length + 2);
        });
        col.width = Math.min(maxLength, 30);
      }

      // === Tambah info periode
      ws.addRow([]);
      const infoRow = ws.addRow([`Periode: ${startDate ?? '-'} s/d ${endDate ?? '-'}`]);
      infoRow.font = { italic: true, size: 10 };
      ws.mergeCells(`A${infoRow.number}:C${infoRow.number}`);

      // === Output Buffer Excel
      const buffer = await wb.xlsx.writeBuffer();
      return Buffer.from(buffer as ArrayBuffer);
    } catch (error) {
      console.error('Error generating Excel export:', error);
      throw new Error('Failed to export Excel');
    }
  }

  async buildActivitySummariesQuery(
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
    typeOfProcessing?: string,
    limit?: number,
    page?: number,
  ) {
    // Pagination setup
    const safeLimit = limit && limit > 0 ? limit : 50;
    const safePage = page && page > 0 ? page : 1;
    const offset = (safePage - 1) * safeLimit;

    // Default tanggal hari ini
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const startMonth = new Date(year, month, 1).toLocaleDateString('en-CA');
    const endMonth = new Date(year, month + 1, 0).toLocaleDateString('en-CA');

    const finalStartDate = startDate && endDate ? startDate : startMonth;
    const finalEndDate = startDate && endDate ? endDate : endMonth;

    const whereFilters: string[] = [];
    const replacements: Record<string, any> = {
      startDate: `${finalStartDate} 00:00:00`,
      endDate: `${finalEndDate} 23:59:59`,
    };

    if (healthcareFacilityId) {
      whereFilters.push(`wb.healthcare_facility_id = :healthcareFacilityId`);
      replacements.healthcareFacilityId = healthcareFacilityId;
    } else if (regencyId) {
      whereFilters.push(`wb.regency_id = :regencyId`);
      replacements.regencyId = regencyId;
    } else if (provinceId) {
      whereFilters.push(`wb.province_id = :provinceId`);
      replacements.provinceId = provinceId;
    }

    if (wasteTypeId) {
      whereFilters.push(`wc.waste_type_id = :wasteTypeId`);
      replacements.wasteTypeId = wasteTypeId;
    }

    if (wasteGroupId) {
      whereFilters.push(`wc.waste_group_id = :wasteGroupId`);
      replacements.wasteGroupId = wasteGroupId;
    }

    if (entityTag) {
      const cleaned = entityTag
        .split(',')
        .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
        .join(', ');
      whereFilters.push(`et.tag IN (${cleaned})`);
    }

    if (typeOfProcessing) {
      if (typeOfProcessing === 'IN') {
        whereFilters.push(`wb.waste_treatment_group_id IS NOT NULL`);
      } else {
        whereFilters.push(`wb.waste_treatment_external_group_id IS NOT NULL`);
      }
    }

    // Daftar tanggal dinamis
    const datesQuery = `
      WITH RECURSIVE dates AS (
        SELECT DATE(:startDate) AS dt
        UNION ALL
        SELECT DATE_ADD(dt, INTERVAL 1 DAY)
        FROM dates
        WHERE dt < DATE(:endDate)
      )
      SELECT DAY(dt) AS dayNum FROM dates
    `;
    const dates: { dayNum: number }[] = await sequelize.query(datesQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const cols = dates.map(
      (date) => `
        COALESCE(SUM(CASE WHEN wb.created_at BETWEEN :startDate AND :endDate AND DAY(wb.created_at) = ${date.dayNum} THEN 1 ELSE 0 END), 0) AS \`${date.dayNum}\`
    `,
    );
    const colsSql = cols.join(',');
    // Main query (WITH pagination)
    const mainSql = `
      SELECT wb.province_id AS provinceId, wb.province_name AS provinceName ,wb.regency_id AS regencyId, 
      wb.regency_name AS regencyName, wb.healthcare_facility_id AS healthcareFacilityId ,wb.healthcare_facility_name AS healthcareFacilityName ,${colsSql}
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      ${whereFilters.length > 0 ? `WHERE ${whereFilters.join(' AND ')}` : ''}
      GROUP BY wb.healthcare_facility_id
      ORDER BY wb.province_id, wb.healthcare_facility_id
      LIMIT :limit OFFSET :offset
    `;

    // Total count query
    const countSql = `
      SELECT COUNT(DISTINCT wb.healthcare_facility_id) AS total
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
      ${whereFilters.length > 0 ? `WHERE ${whereFilters.join(' AND ')}` : ''}
    `;

    replacements.limit = safeLimit;
    replacements.offset = offset;

    return {
      mainSql,
      countSql,
      replacements,
      dates,
      pagination: { limit: safeLimit, page: safePage },
    };
  }

  async buildActivityManualScaleQuery(
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
    limit?: number,
    page?: number,
  ): Promise<{ mainSql: string; countSql: string }> {
    const safeLimit = limit && limit > 0 ? limit : 50;
    const safePage = page && page > 0 ? page : 1;
    const offset = (safePage - 1) * safeLimit;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const finalStartDate = startDate || todayStr;
    const finalEndDate = endDate || todayStr;

    const whereClauses: string[] = [
      `wb.created_at BETWEEN '${finalStartDate} 00:00:00' AND '${finalEndDate} 23:59:59'`,
    ];

    if (healthcareFacilityId)
      whereClauses.push(`wb.healthcare_facility_id = ${healthcareFacilityId}`);
    else if (regencyId) whereClauses.push(`wb.regency_id = ${regencyId}`);
    else if (provinceId) whereClauses.push(`wb.province_id = ${provinceId}`);

    if (wasteTypeId) whereClauses.push(`wc.waste_type_id = ${wasteTypeId}`);
    if (wasteGroupId) whereClauses.push(`wc.waste_group_id = ${wasteGroupId}`);

    if (entityTag) {
      const cleaned = entityTag
        .split(',')
        .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
        .join(', ');
      whereClauses.push(`et.tag IN (${cleaned})`);
    }

    const whereSQL = whereClauses.join(' AND ');

    const dateRows: { dt: string; dayNum: number }[] = await sequelize.query(
      `
            WITH RECURSIVE dates AS (
                SELECT DATE(:startDate) AS dt
                UNION ALL
                SELECT DATE_ADD(dt, INTERVAL 1 DAY)
                FROM dates
                WHERE dt < DATE(:endDate)
            )
            SELECT dt, DAY(dt) AS dayNum FROM dates;
            `,
      {
        replacements: { startDate: finalStartDate, endDate: finalEndDate },
        type: QueryTypes.SELECT,
      },
    );

    const pivotCols = dateRows
      .map(
        (d) =>
          `COALESCE(SUM(CASE WHEN DAY(d.dt) = ${d.dayNum} THEN scale_method ELSE 0 END), 0) AS \`${d.dayNum}\``,
      )
      .join(',\n');

    const mainSql = `
            WITH RECURSIVE dates AS (
                SELECT DATE('${finalStartDate}') AS dt
                UNION ALL
                SELECT DATE_ADD(dt, INTERVAL 1 DAY)
                FROM dates
                WHERE dt < DATE('${finalEndDate}')
            ),
            daily AS (
                SELECT 
                    wb.healthcare_facility_id AS healthcareFacilityId,
                    wb.healthcare_facility_name AS healthcareFacilityName,
                    wb.province_id AS provinceId,
                    DATE(wb.created_at) AS dt,
                    CASE WHEN wb.scale_method = 'MANUAL' THEN 1 ELSE 0 END AS scale_method
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                WHERE ${whereSQL}
                GROUP BY wb.healthcare_facility_id, DATE(wb.created_at), wb.scale_method
            )
            SELECT 
                healthcareFacilityId,
                healthcareFacilityName,
                provinceId,
                ${pivotCols}
            FROM daily d
            LEFT JOIN dates USING (dt)
            GROUP BY provinceId, healthcareFacilityId
            ORDER BY provinceId
            LIMIT ${limit} OFFSET ${offset};
        `;

    const countSql = `
            SELECT COUNT(DISTINCT wb.healthcare_facility_id) AS total
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
            WHERE ${whereSQL};
        `;

    return { mainSql, countSql };
  }
}
