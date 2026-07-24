import { QueryTypes } from 'sequelize';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';
import { paginationUtils } from '../../../shared/utils/pagination';
import { sequelize } from '../db.connection';
import ReportTransactionWasteBag from '../../../domain/entities/TransactionWasteBag';
import {
  WasteBagHistory,
  WasteBagSummaryByCharacteristics,
  WasteSourceSummary,
} from '../../../domain/entities/WasteBagTrackingHistory';
import { WasteBagLogBook, WasteGroupDetails } from '../../../domain/entities/WasteBagLogBook';
import { getLogHistories } from '../../../shared/utils/logHistories';

export default class ReportWasteBagRepositoryImpl implements ReportWasteBagRepository {
  async getAllTransactionWasteBagRaw(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
    search?: string,
    healthcareId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    transporterId?: number,
    treatmentStatus?: string,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: ReportTransactionWasteBag[];
    totals: {};
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
      const offset = (safePage - 1) * safeLimit;

      const whereClauses: string[] = [];
      const replacements: Record<string, any> = {};

      if (healthcareId) {
        whereClauses.push(`wb.healthcare_facility_id = :healthcareId`);
        replacements.healthcareId = healthcareId;
      }
      if (transporterId) {
        whereClauses.push(`wb.transporter_id = :transporterId`);
        replacements.transporterId = transporterId;
      }
      if (startDate && endDate) {
        whereClauses.push(
          `CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
        );
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }
      if (treatmentStatus) {
        whereClauses.push(
          `(wg.treatment_status = :treatmentStatus OR wrg.transportation_status = :treatmentStatus)`,
        );
        replacements.treatmentStatus = treatmentStatus;
      }
      if (wasteTypeId) {
        whereClauses.push(`wcx.waste_type_id = :wasteTypeId`);
        replacements.wasteTypeId = wasteTypeId;
      }
      if (wasteGroupId) {
        whereClauses.push(`wcx.waste_group_id = :wasteGroupId`);
        replacements.wasteGroupId = wasteGroupId;
      }
      if (wasteCharacteristicsId) {
        whereClauses.push(`wcx.waste_characteristics_id = :wasteCharacteristicsId`);
        replacements.wasteCharacteristicsId = wasteCharacteristicsId;
      }
      if (search) {
        whereClauses.push(`wb.waste_bag_qr_code_id LIKE :search`);
        replacements.search = `%${search}%`;
      }
      if (provinceId) {
        whereClauses.push(`wb.province_id = :provinceId`);
        replacements.provinceId = provinceId;
      }

      if (cityId) {
        whereClauses.push(`wb.regency_id = :cityId`);
        replacements.cityId = cityId;
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const baseCTE = `
            WITH filtered_data AS (
            SELECT
                wb.id, wb.created_at "createdAt", wcx.waste_code "wasteCode", wb.waste_bag_qr_code_id "qrCode",
                wc.name AS wasteCharacteristicsName, wb.waste_status "wasteStatus", wb.weight_in_kgs "weightInKgs",
                wb.actual_storage_end_timestamp "actualStorageEndDatetime", wb.healthcare_facility_id "healthcareFacilityId",
                wb.waste_source_id "wasteSourceId", wb.waste_classification_id "wasteClassificationId", wb.transporter_id "transporterId",
                wb.third_party_id "thirdPartyId", wt.name "wasteTypeName", wgh.name "wasteGroupName",wb.waste_status_updated_at "wasteStatusUpdatedAt",
                CASE
                    WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
                    WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN ws.internal_treatment_name
                    ELSE ws.external_healthcare_facility_name
                END AS wasteSource,
                p.provider_type wasteTreatment,
                CASE WHEN wb.waste_status = 'IN_COLD_STORAGE' THEN ROUND(wcx.cold_storage_max_hours/24)
                ELSE ROUND(wcx.temp_storage_max_hours/24) END storageMax,
                CASE WHEN
                wb.waste_treatment_group_id IS NOT NULL and wteg.id IS NULL
                then wg.group_id else wteg.group_id END AS "wasteGroupNumber",
                wb.created_at "checkInDate", wteg.updated_at "checkOutDate",
                case when wteg.id IS NOT NULL then wb.weight_in_kgs
                when waste_treatment_group_id IS NOT NULL then wb.weight_in_kgs
                ELSE 0 END weightOutKgs,
                case when wteg.id IS NOT NULL then 1
                when waste_treatment_group_id IS NOT NULL then 1
                ELSE 0 END wasteBagOut,
                wb.manifest_doc_number manifestDocNumber,
                wb.province_name provinceName, wb.regency_name regencyName, wb.healthcare_facility_name healthcareFacilityName,
                wb.transporter_name transporterName, wb.third_party_name thirdPartyName, wb.district_name districtName,
                wcx.disposal_method disposalMethod,
                wc.name_en wasteCharacteristicsNameEn, wt.name_en wasteTypeNameEn, wgh.name_en wasteGroupNameEn,
                u.firstname AS operatorHealthcareName
            FROM waste_bag wb
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            JOIN waste_classification wcx ON wcx.id = wb.waste_classification_id
            JOIN waste_hierarchy wc ON wc.id = wcx.waste_characteristics_id
            JOIN waste_hierarchy wt ON wt.id = wcx.waste_type_id
            JOIN waste_hierarchy wgh ON wgh.id = wcx.waste_group_id
            LEFT JOIN users u ON u.user_uuid = wb.created_by
            LEFT JOIN waste_treatment_group wg ON wg.id = wb.waste_treatment_group_id
            LEFT JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id and wteg.transportation_status != 'READY_FOR_TRANSPORT'
            LEFT JOIN waste_treatment_external_group wtrg ON wtrg.id = wb.waste_treatment_external_group_id
            LEFT JOIN partnership p ON p.provider_id = wb.transporter_id AND p.transporter_id IS NULL
            AND wcx.id = p.waste_classification_id AND p.consumer_id = wb.healthcare_facility_id AND p.partnership_status = 'ACTIVE'
            ${whereSQL}
        )`;

      const dataSql = `
            ${baseCTE}
            SELECT * FROM filtered_data
            ORDER BY createdAt DESC
            LIMIT :limit OFFSET :offset;
        `;

      const countSql = `
            ${baseCTE}
            SELECT COUNT(*) AS total, SUM(weightInKgs) AS "weightInKgs",
            SUM(weightOutKgs) AS "weightOutKgs", SUM(wasteBagOut) AS "wasteBagOut"
            FROM filtered_data;
        `;

      const data = await sequelize.query(dataSql, {
        replacements: { ...replacements, limit: safeLimit, offset },
        type: QueryTypes.SELECT,
      });

      const [countResult] = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const total = Number((countResult as any)?.total ?? 0);
      const weightInKgs = parseFloat(
        Number((countResult as any)?.weightInKgs ?? 0).toString(),
      ).toFixed(3);
      const weightOutKgs = parseFloat(
        Number((countResult as any)?.weightOutKgs ?? 0).toString(),
      ).toFixed(3);
      const wasteBagOut = Number((countResult as any)?.wasteBagOut ?? 0);
      const pages = Math.ceil(total / safeLimit);

      (data as any[]).forEach((row) => {
        if (row.actualStorageEndDatetime && row.storageMax != null) {
          const withStorageMax = new Date(row.actualStorageEndDatetime);
          withStorageMax.setDate(withStorageMax.getDate() + Number(row.storageMax));
          row.actualStorageEndDatetime = withStorageMax;
        }
      });
      const typedData = data as ReportTransactionWasteBag[];

      return {
        data: typedData,
        totals: {
          weightInKgs: weightInKgs,
          wasteInBags: total,
          weightOutKgs: weightOutKgs,
          wasteOutBags: wasteBagOut,
        },
        pagination: {
          total,
          pages,
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getAllTransactionWasteBagRaw:', error);
      throw new Error('Database error');
    }
  }

  async getWasteBagSummaryByCharacteristics(
    limit: number,
    page: number,
    startDate: string,
    endDate: string,
    includeWasteStatus?: boolean,
    healthcareId?: number,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: WasteBagSummaryByCharacteristics[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
  }> {
    try {
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required.');
      }

      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });
      const offset = (safePage - 1) * safeLimit;

      const whereClauses: string[] = [];
      const replacements: any = {
        limit: safeLimit,
        offset,
      };

      if (healthcareId) {
        whereClauses.push(`a.healthcare_facility_id = :healthcareId`);
        replacements.healthcareId = healthcareId;
      }
      if (provinceId) {
        whereClauses.push(`a.province_id = :provinceId`);
        replacements.provinceId = provinceId;
      }
      if (cityId) {
        whereClauses.push(`a.regency_id = :cityId`);
        replacements.cityId = cityId;
      }
      if (startDate && endDate) {
        whereClauses.push(
          `CONVERT_TZ(a.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
        );
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      // bagian dinamis group by
      const groupByCols = includeWasteStatus
        ? `a.healthcare_facility_name, wc.waste_characteristics_id, a.waste_status`
        : `a.healthcare_facility_name, wc.waste_characteristics_id`;

      const selectWasteStatus = includeWasteStatus ? `a.waste_status AS wasteStatus,` : ``;

      const sql = `
                WITH date_range AS (
                    SELECT DATEDIFF(:endDate, :startDate) + 1 AS days_count
                )
                SELECT
                    wt.name wasteTypeName,
                    wg.name wasteGroupName,
                    wh.name AS wasteCharacteristicsName,
                    wh.name_en wasteCharacteristicsNameEn,
                    wt.name_en wasteTypeNameEn,
                    wg.name_en wasteGroupNameEn,
                    ${selectWasteStatus}
                    wc.disposal_method disposalMethod,
                    COUNT(a.id) AS totalWasteBag,
                    SUM(a.weight_in_kgs) AS totalWeightInKgs,
                    -- Tambahan untuk scale_method MANUAL
                    SUM(CASE WHEN a.scale_method = 'MANUAL' THEN a.weight_in_kgs ELSE 0 END) AS manualWeightInKgs,
                    COUNT(CASE WHEN a.scale_method = 'MANUAL' THEN a.id END) AS manualWasteBagCount,
                    -- Tambahan untuk scale_method IOT
                    SUM(CASE WHEN a.scale_method = 'IOT' THEN a.weight_in_kgs ELSE 0 END) AS iotWeightInKgs,
                    COUNT(CASE WHEN a.scale_method = 'IOT' THEN a.id END) AS iotWasteBagCount,
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
                GROUP BY ${groupByCols}
                ORDER BY wh.name
                LIMIT :limit OFFSET :offset
            `;

      const countSql = `
                SELECT COUNT(*) total, sum(a.weight_in_kgs) totalWeightInKgs FROM (
                    SELECT ${groupByCols}, sum(a.weight_in_kgs) weight_in_kgs
                    FROM waste_bag a
                    JOIN waste_classification wc ON wc.id = a.waste_classification_id
                    JOIN waste_hierarchy wh ON wh.id = wc.waste_characteristics_id
                    ${whereSQL}
                    GROUP BY ${groupByCols}
                ) a
            `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const [countResult] = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const total = Number((countResult as any).total || 0);
      const totalWeightInKgs = Number((countResult as any).totalWeightInKgs || 0);
      const pages = Math.ceil(total / safeLimit);

      return {
        data: data as WasteBagSummaryByCharacteristics[],
        pagination: {
          total,
          pages,
          currentPage: safePage,
          perPage: safeLimit,
          totalWeightInKgs,
        },
      };
    } catch (error) {
      console.error('Error in getWasteBagSummaryByCharacteristics:', error);
      throw new Error('Database error');
    }
  }

  async getWasteSourceSummary(
    limit: number,
    page: number,
    startDate: string,
    endDate: string,
    healthcareId?: number,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: WasteSourceSummary[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
    summary: {
      totalInternal: number;
      totalInternalTreatment: number;
      totalExternal: number;
    };
  }> {
    try {
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required.');
      }

      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });
      const offset = (safePage - 1) * safeLimit;

      const whereClauses: string[] = [];
      const replacements: any = {
        limit: safeLimit,
        offset: offset,
      };

      if (healthcareId) {
        whereClauses.push(`wb.healthcare_facility_id = :healthcareId`);
        replacements.healthcareId = healthcareId;
      }

      if (provinceId) {
        whereClauses.push(`wb.province_id = :provinceId`);
        replacements.provinceId = provinceId;
      }

      if (cityId) {
        whereClauses.push(`wb.regency_id = :cityId`);
        replacements.cityId = cityId;
      }

      if (startDate && endDate) {
        whereClauses.push(
          `CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
        );
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const sql = `
            SELECT
                CASE
                    WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
                    WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN ws.internal_treatment_name
                    ELSE ws.external_healthcare_facility_name
                END AS wasteSourceName,
                ws.source_type AS "sourceType",
                COUNT(wb.id) AS totalWasteBag,
                SUM(wb.weight_in_kgs) AS totalWeightInKgs
            FROM waste_bag wb
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            ${whereSQL}
            GROUP BY wb.waste_source_id, ws.source_type
            ORDER BY ws.source_type ASC
            LIMIT :limit OFFSET :offset
        `;

      const countSql = `
            SELECT COUNT(*) AS total, sum(a.weight_in_kgs) AS totalWeightInKgs FROM (
                SELECT wb.waste_source_id, sum(wb.weight_in_kgs) weight_in_kgs
                FROM waste_bag wb
                JOIN waste_source ws ON ws.id = wb.waste_source_id
                ${whereSQL}
                GROUP BY wb.waste_source_id, ws.source_type
            ) a
        `;

      const summarySql = `
            SELECT 
                ws.source_type,
                SUM(wb.weight_in_kgs) AS totalWeight
            FROM waste_bag wb
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            ${whereSQL}
            GROUP BY ws.source_type
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const [countResult] = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const summaryRows = await sequelize.query(summarySql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const total = Number((countResult as any).total || 0);
      const totalWeightInKgs = Number((countResult as any).totalWeightInKgs || 0);
      const pages = Math.ceil(total / safeLimit);

      let totalInternal = 0,
        totalInternalTreatment = 0,
        totalExternal = 0;

      summaryRows.forEach((row: any) => {
        switch (row.source_type) {
          case 'INTERNAL':
            totalInternal = Number(row.totalWeight || 0);
            break;
          case 'INTERNAL_TREATMENT':
            totalInternalTreatment = Number(row.totalWeight || 0);
            break;
          default:
            totalExternal = Number(row.totalWeight || 0);
            break;
        }
      });

      return {
        data: data as WasteSourceSummary[],
        pagination: {
          total,
          pages,
          currentPage: safePage,
          perPage: safeLimit,
          totalWeightInKgs,
        },
        summary: {
          totalInternal,
          totalInternalTreatment,
          totalExternal,
        },
      };
    } catch (error) {
      console.error('Error in getWasteBagSummaryBySource:', error);
      throw new Error('Database error');
    }
  }

  async getWasteBagHistory(
    wasteBagId?: number,
    wasteBagQrCode?: string,
    wasteGroupNumber?: string,
  ): Promise<WasteBagHistory[]> {
    const data = await getLogHistories(wasteBagId, wasteGroupNumber, wasteBagQrCode);

    return data as WasteBagHistory[];
  }

  async getWasteBagLogBook(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
    search?: string,
  ): Promise<{
    data: WasteBagLogBook[];
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
      const offset = (safePage - 1) * safeLimit;

      const whereClauses: string[] = [];
      const replacements: any = {
        limit: safeLimit,
        offset: offset,
      };

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
      whereClauses.push(`wrg.transportation_status = 'IN_TRANSIT'`);
      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const sql = `SELECT wrg.id "wasteGroupId", wrg.group_id "wasteGroupNumber", wrg.total_bags_count "totalBagsCount",
                wrg.total_weight_in_kgs "totalWeightInKgs", wrg.transporter_operator_id "transporterOperatorId",
                pv.vehicle_number "vehicleNumber", wrg.transporter_id "providerId", wrg.updated_at "dropTime",
                wrg.pickup_at "pickupTime",

                CASE
                    WHEN wb.disposal_method = 'TRANSPORTER_TREATMENT'
                        THEN DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z')
                    ELSE NULL
                END AS processTime,

                CASE
                    WHEN wb.disposal_method = 'TRANSPORTER_LANDFILL'
                        THEN DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z')
                    ELSE NULL
                END AS landfillTime,

                CASE
                    WHEN wb.disposal_method = 'TRANSPORTER_RECYCLER'
                        THEN DATE_FORMAT(CONVERT_TZ(wrg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z')
                    ELSE NULL
                END AS recycleTime,
                wb.healthcare_facility_name "healthcareFacilityName",
                wb.transporter_name thirdPartyName,
                wb.healthcare_facility_id "healthcareFacilityId",
                wb.disposal_method disposalMethod,
                us.firstname AS operatorName
                FROM waste_transportation_external_group wrg
                LEFT JOIN partner_vehicle pv ON pv.id = wrg.transporter_vehicle_id
                LEFT JOIN waste_treatment_external_group wtrg on wtrg.group_id = wrg.group_id
                LEFT JOIN users us ON us.user_uuid = wrg.transporter_operator_id
                JOIN (
              SELECT waste_transportation_external_group_id, wb.healthcare_facility_id, wb.healthcare_facility_name,
              wb.transporter_name, wc.disposal_method
              FROM waste_bag wb
              JOIN waste_classification wc ON wc.id = wb.waste_classification_id
              GROUP BY wb.waste_transportation_external_group_id
            ) wb ON wb.waste_transportation_external_group_id = wrg.id
                  ${whereSQL}
                  order by wrg.id desc
                  LIMIT :limit OFFSET :offset
              `;

      const countSql = `select count(*) total
                FROM waste_transportation_external_group wrg
                JOIN (
              SELECT waste_transportation_external_group_id, wb.healthcare_facility_id, wb.healthcare_facility_name,
              wb.transporter_name
              FROM waste_bag wb
              GROUP BY wb.waste_transportation_external_group_id
            ) wb ON wb.waste_transportation_external_group_id = wrg.id
                  ${whereSQL}
              `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const [countResult] = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const total = Number((countResult as any).total || 0);
      const pages = Math.ceil(total / safeLimit);
      const typedData = data as WasteBagLogBook[];

      return {
        data: typedData,
        pagination: {
          total,
          pages,
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in WasteBagLogBook:', error);
      throw new Error('Database error');
    }
  }

  async getWasteGroupDetails(
    limit: number,
    page: number,
    wasteGroupId: number,
  ): Promise<{
    data: WasteGroupDetails[];
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
      const offset = (safePage - 1) * safeLimit;

      const baseQuery = `
            FROM waste_bag a
            JOIN waste_classification b ON b.id = a.waste_classification_id
            JOIN waste_hierarchy c ON c.id = b.waste_type_id
            JOIN waste_hierarchy d ON d.id = b.waste_group_id
            JOIN waste_hierarchy e ON e.id = b.waste_characteristics_id
            WHERE a.waste_transportation_external_group_id = :wasteGroupId
        `;

      const dataSql = `
            SELECT
                a.waste_bag_qr_code_id AS "wasteQrCode",
                c.name AS "wasteTypeName",
                d.name AS "wasteGroupName",
                e.name AS "wasteCharacteristicsName",
                c.name_en AS "wasteTypeNameEn",
                d.name_en AS "wasteGroupNameEn",
                e.name_en AS "wasteCharacteristicsNameEn",
                a.weight_in_kgs AS "wasteWeight"
            ${baseQuery}
            LIMIT :limit OFFSET :offset
        `;

      const countSql = `SELECT COUNT(*) AS total ${baseQuery}`;

      const replacements = {
        wasteGroupId,
        limit: safeLimit,
        offset,
      };

      const [data, [countResult]] = await Promise.all([
        sequelize.query(dataSql, { replacements, type: QueryTypes.SELECT }),
        sequelize.query(countSql, { replacements, type: QueryTypes.SELECT }),
      ]);

      const total = Number((countResult as any).total || 0);

      return {
        data: data as WasteGroupDetails[],
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getDetailWasteGroup:', error);
      throw new Error('Database error');
    }
  }

  async GetWasteBagSummaryByWasteStatus(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
  ): Promise<{
    data: any[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
  }> {
    try {
      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });
      const offset = (safePage - 1) * safeLimit;

      const whereClauses: string[] = [];
      const replacements: any = {
        limit: safeLimit,
        offset,
        entityId,
      };

      if (startDate && endDate) {
        whereClauses.push(
          `CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
        );
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }

      whereClauses.push(`wb.healthcare_facility_id = :entityId`);
      // whereClauses.push(`wbat.waste_bag_status IS NOT NULL`);

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const sql = `
        WITH latest_ids AS (
          SELECT waste_bag_id, MAX(id) AS max_id
          FROM waste_bag_audit_trail
          WHERE healthcare_facility_id = :entityId
            AND waste_bag_status IS NOT NULL
          GROUP BY waste_bag_id
        ),
        latest_status AS (
          SELECT abt.waste_bag_id, abt.waste_bag_status
          FROM waste_bag_audit_trail abt
          INNER JOIN latest_ids li ON li.max_id = abt.id
        )
        SELECT
          COUNT(*) AS totalWasteBag,
          SUM(wb.weight_in_kgs) AS totalWeightInKgs,
          ls.waste_bag_status AS wasteStatus
        FROM waste_bag wb
        JOIN latest_status ls
            ON ls.waste_bag_id = wb.waste_bag_qr_code_id
        ${whereSQL}
        GROUP BY ls.waste_bag_status
        LIMIT :limit OFFSET :offset
      `;

      const countSql = `
        WITH latest_ids AS (
          SELECT waste_bag_id, MAX(id) AS max_id
          FROM waste_bag_audit_trail
          WHERE healthcare_facility_id = :entityId
            AND waste_bag_status IS NOT NULL
          GROUP BY waste_bag_id
        ),
        latest_status AS (
          SELECT abt.waste_bag_id, abt.waste_bag_status
          FROM waste_bag_audit_trail abt
          INNER JOIN latest_ids li ON li.max_id = abt.id
        )
        SELECT
          COUNT(DISTINCT ls.waste_bag_status) AS total,
          SUM(wb.weight_in_kgs) AS totalWeightInKgs
        FROM waste_bag wb
        JOIN latest_status ls
            ON ls.waste_bag_id = wb.waste_bag_qr_code_id
        ${whereSQL}
      `;

      const [data, countRows] = await Promise.all([
        sequelize.query(sql, {
          replacements,
          type: QueryTypes.SELECT,
        }),
        sequelize.query(countSql, {
          replacements,
          type: QueryTypes.SELECT,
        }),
      ]);

      const countResult = countRows[0];

      const total = Number((countResult as any)?.total || 0);
      const totalWeightInKgs = Number((countResult as any)?.totalWeightInKgs || 0);
      const pages = Math.ceil(total / safeLimit);

      return {
        data,
        pagination: {
          total,
          pages,
          currentPage: safePage,
          perPage: safeLimit,
          totalWeightInKgs,
        },
      };
    } catch (error) {
      console.error('Error in WasteBagLogBook:', error);
      throw new Error('Database error');
    }
  }

  async GetWasteBagByWasteStatus(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteStatus?: string,
    lang?: string,
  ): Promise<{
    data: any[];
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
      const offset = (safePage - 1) * safeLimit;

      const whereClauses: string[] = [];
      const replacements: any = {
        limit: safeLimit,
        offset,
        entityId,
      };

      // ---------- FILTER DATE ----------
      if (startDate && endDate) {
        whereClauses.push(
          `CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
        );
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }

      // ---------- FILTER ENTITY ----------
      whereClauses.push(`wb.healthcare_facility_id = :entityId`);
      whereClauses.push(`wbat.waste_bag_status IS NOT NULL`);

      // ---------- FILTER WASTE TYPE ----------
      if (wasteTypeId) {
        whereClauses.push(`wc.waste_type_id = :wasteTypeId`);
        replacements.wasteTypeId = wasteTypeId;
      }

      // ---------- FILTER WASTE GROUP ----------
      if (wasteGroupId) {
        whereClauses.push(`wc.waste_group_id = :wasteGroupId`);
        replacements.wasteGroupId = wasteGroupId;
      }

      // ---------- FILTER WASTE STATUS ----------
      if (wasteStatus && wasteStatus.trim() !== '') {
        whereClauses.push(`wbat.waste_bag_status = :wasteStatus`);
        replacements.wasteStatus = wasteStatus.trim();
      }

      // ---------- FILTER WASTE STATUS ----------
      if (wasteStatus && wasteStatus.trim() !== '') {
        whereClauses.push(`wbat.waste_bag_status = :wasteStatus`);
        replacements.wasteStatus = wasteStatus.trim();
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // ---------- LANGUAGE SELECT ----------
      const nameWasteType =
        lang === 'en' ? 'wt.name_en AS wasteTypeName' : 'wt.name AS wasteTypeName';
      const nameWasteGroup =
        lang === 'en' ? 'wg.name_en AS wasteGroupName' : 'wg.name AS wasteGroupName';
      const nameWasteChar =
        lang === 'en'
          ? 'wch.name_en AS wasteCharacteristicsName'
          : 'wch.name AS wasteCharacteristicsName';

      const sql = `
            SELECT *
            FROM (
                SELECT 
                    wb.waste_bag_qr_code_id AS wasteBagQrCodeId,
                    wbat.waste_bag_status AS wasteStatus,
                    wb.weight_in_kgs AS weightInKgs,
                    ${nameWasteType},
                    ${nameWasteGroup},
                    ${nameWasteChar},
                    wb.created_at AS createdAt,
                    wc.disposal_method disposalMethod
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
                JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
                JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
                JOIN (
                    SELECT wbat.waste_bag_id, wbat.waste_bag_status
                    FROM waste_bag_audit_trail wbat
                    JOIN (
                        SELECT waste_bag_id, MAX(id) AS id
                        FROM waste_bag_audit_trail
                        WHERE is_group = 1
                        GROUP BY waste_bag_id
                    ) t ON t.waste_bag_id = wbat.waste_bag_id AND t.id = wbat.id
                    WHERE wbat.is_group = 1
                ) wbat ON wbat.waste_bag_id = wb.waste_bag_qr_code_id
                ${whereSQL}
                GROUP BY wb.id
                ORDER BY wb.created_at DESC
            ) a
            LIMIT :limit OFFSET :offset
        `;

      const countSql = `
            SELECT count(*) AS total
            FROM (
                SELECT 
                    wb.waste_bag_qr_code_id AS wasteBagQrCodeId,
                    wbat.waste_bag_status AS wasteStatus,
                    wb.weight_in_kgs AS weightInKgs,
                    ${nameWasteType},
                    ${nameWasteGroup},
                    ${nameWasteChar},
                    wb.created_at AS createdAt
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
                JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
                JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
                JOIN (
                    SELECT wbat.waste_bag_id, wbat.waste_bag_status
                    FROM waste_bag_audit_trail wbat
                    JOIN (
                        SELECT waste_bag_id, MAX(id) AS id
                        FROM waste_bag_audit_trail
                        WHERE is_group = 1
                        GROUP BY waste_bag_id
                    ) t ON t.waste_bag_id = wbat.waste_bag_id AND t.id = wbat.id
                    WHERE wbat.is_group = 1
                ) wbat ON wbat.waste_bag_id = wb.waste_bag_qr_code_id
                ${whereSQL}
                GROUP BY wb.id
                ORDER BY wb.created_at DESC
            ) a
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const [countResult] = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const total = Number((countResult as any)?.total || 0);
      const pages = Math.ceil(total / safeLimit);

      return {
        data,
        pagination: {
          total,
          pages,
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in GetWasteBagByWasteStatus:', error);
      throw new Error('Database error');
    }
  }

  async getWasteBagDetailsInternalTreatment(wasteBagQrCodeId: string, lang?: string): Promise<any> {
    try {
      const query = `
      SELECT 
        wbs.group_id AS groupId,
        wb.waste_bag_qr_code_id AS wasteBagQrcodeId,
        wt.name AS wasteTypeName,
        wt.name_en AS wasteTypeNameEn,
        wg.name AS wasteGroupName,
        wg.name_en AS wasteGroupNameEn,
        wch.name AS wasteCharacteristicsName,
        wch.name_en AS wasteCharacteristicsNameEn,
        wbs.total_weight_in_kgs AS totalWeightInKgs,
        wb.weight_in_kgs AS weightInKgs
      FROM waste_bag wb
      JOIN waste_classification wc ON wc.id = wb.waste_classification_id
      JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
      JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
      JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
      JOIN (
        SELECT 
          wtg.id,
          wtg.group_id,
          wtg.total_weight_in_kgs
        FROM waste_bag wb
        JOIN waste_treatment_group wtg
          ON FIND_IN_SET(wtg.id, wb.waste_group_ids) > 0
        WHERE wb.waste_bag_qr_code_id = :wasteBagQrCodeId 
          AND wb.waste_group_ids IS NOT NULL
      ) wbs ON wbs.id = wb.waste_treatment_group_id
    `;

      const rows: any[] = await sequelize.query(query, {
        replacements: { wasteBagQrCodeId },
        type: QueryTypes.SELECT,
      });

      if (!rows.length) return [];

      const grouped: Record<string, any> = {};

      for (const row of rows) {
        if (!grouped[row.groupId]) {
          grouped[row.groupId] = {
            wasteQrCode: wasteBagQrCodeId,
            groupId: row.groupId,
            wasteTypeName: lang === 'en' ? row.wasteTypeNameEn : row.wasteTypeName,
            wasteGroupName: lang === 'en' ? row.wasteGroupNameEn : row.wasteGroupName,
            wasteCharacteristicsName:
              lang === 'en' ? row.wasteCharacteristicsNameEn : row.wasteCharacteristicsName,
            totalWeightInKgs: Number(row.totalWeightInKgs),
            wasteBags: [],
          };
        }

        grouped[row.groupId].wasteBags.push({
          groupId: row.groupId,
          wasteBagQrcodeId: row.wasteBagQrcodeId,
          wasteTypeName: lang === 'en' ? row.wasteTypeNameEn : row.wasteTypeName,
          wasteGroupName: lang === 'en' ? row.wasteGroupNameEn : row.wasteGroupName,
          wasteCharacteristicsName:
            lang === 'en' ? row.wasteCharacteristicsNameEn : row.wasteCharacteristicsName,
          weightInKgs: Number(row.weightInKgs),
        });
      }

      // ubah dari [{ item: {...} }] menjadi langsung array of object
      const formatted = Object.values(grouped);

      return formatted;
    } catch (error: any) {
      console.error('Error in wasteBagDetailsInternalTreatment:', error);
      throw new Error(error.message || 'Failed to fetch waste bag details');
    }
  }
}
