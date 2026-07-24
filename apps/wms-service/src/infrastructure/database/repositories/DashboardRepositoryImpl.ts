import { WasteTransportationExternalGroupModel } from './../models/WasteTransportationExternalGroupModel';
import DashboardWasteHierarchy, {
  DashboardHealthcare,
  DashboardThirdParty,
  DashboardWasteCharacteristicsSummary,
  DashboardWasteGroupDetailsByAction,
} from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';
import { paginationUtils } from '../../../shared/utils/pagination';
import { getUsersDetail } from '../../external-apis/thirdPartyClient';
import { sequelize } from '../db.connection';
import { QueryTypes, UniqueConstraintError } from 'sequelize';
import WasteBagModel from '../models/WasteBagModel';
import { Op } from 'sequelize';

export default class DashboardRepositoryImpl implements DashboardRepository {
  async getSumaryPerDay(entityId: number): Promise<{
    wasteBagOutResult: {
      totalBags: number;
      totalWeight: string;
    };
    wasteBagThisDay: {
      totalBags: number;
      totalWeight: string;
    };
  }> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const listWasteBagOut = await WasteTransportationExternalGroupModel.findAll({
        where: {
          created_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
          transportationStatus: 'IN_TRANSIT',
        },
        attributes: ['id', 'totalBagsCount', 'totalWeightInKgs'],
        include: [
          {
            model: WasteBagModel,
            as: 'wasteBags',
            where: {
              healthcareFacilityId: entityId,
            },
            attributes: ['id'],
          },
        ],
      });

      const listWasteBagWeight = await WasteBagModel.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
          healthcareFacilityId: entityId,
        },
        attributes: ['id', 'weightInKgs'],
      });

      const totalBagsThisDay = listWasteBagWeight.length;
      const totalWeightThisDay = listWasteBagWeight.reduce((sum, data) => {
        const raw = data.dataValues.weightInKgs || '0';
        const normalized = parseFloat(String(raw).replace(/\./g, '').replace(',', '.'));
        return sum + (isNaN(normalized) ? 0 : normalized);
      }, 0);

      return {
        wasteBagOutResult: {
          totalBags: listWasteBagOut.reduce(
            (sum, d) => sum + (d.dataValues.totalBagsCount || 0),
            0,
          ),
          totalWeight:
            Math.floor(
              listWasteBagOut.reduce((sum, d) => {
                const raw = d.dataValues.totalWeightInKgs || '0';
                const normalized = parseFloat(String(raw).replace(/\./g, ''));
                return sum + (isNaN(normalized) ? 0 : normalized);
              }, 0),
            ) + ' Kg',
        },
        wasteBagThisDay: {
          totalBags: totalBagsThisDay,
          totalWeight: totalWeightThisDay + ' Kg',
        },
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating data: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating data');
      }
    }
  }

  async getSummaryWasteHierarchy(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
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
      const offset = (safePage - 1) * safeLimit;

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const finalStartDate = startDate || todayStr;
      const finalEndDate = endDate || todayStr;

      const replacements: Record<string, any> = {
        limit: safeLimit,
        offset,
        startDate: `${finalStartDate} 00:00:00`,
        endDate: `${finalEndDate} 23:59:59`,
      };

      const pivotColsQuery = `
            SELECT GROUP_CONCAT(
                DISTINCT CONCAT(
                    'SUM(CASE WHEN wc.waste_type_id = ''',
                    wc.waste_type_id,
                    ''' THEN wb.weight_in_kgs ELSE 0 END) AS \`',
                    wc.waste_type_id, '_', wt.name, '\`'
                )
                ORDER BY wt.name
            ) AS cols
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0 AND wt.is_active = 1
              AND wb.created_at BETWEEN :startDate AND :endDate
        `;

      const [{ cols: pivotCols = '' }] = (await sequelize.query(pivotColsQuery, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { cols: string }[];

      const sql = `
            SELECT wb.province_id AS provinceId,
                   wb.province_name AS provinceName,
                   COUNT(wb.id) AS totalWasteBag,
                   SUM(IFNULL(wb.weight_in_kgs,0)) AS totalWeight,
                   ${pivotCols || '0 AS dummy_col'}
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wb.weight_in_kgs > 0
              AND wt.level = 0
              AND wb.created_at BETWEEN :startDate AND :endDate
            GROUP BY wb.province_id
            LIMIT :limit OFFSET :offset
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const countSql = `
            SELECT COUNT(DISTINCT wb.province_id) AS total
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0
              AND wb.created_at BETWEEN :startDate AND :endDate
        `;

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
      console.error('Error in getSummaryWasteHierarchy:', error);
      throw new Error('Database error');
    }
  }

  async getSummaryWasteHierarchyByProvince(
    limit: number,
    page: number,
    provinceId: number,
    startDate?: string,
    endDate?: string,
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
      const offset = (safePage - 1) * safeLimit;

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const finalStartDate = startDate || todayStr;
      const finalEndDate = endDate || todayStr;

      const replacements: Record<string, any> = {
        limit: safeLimit,
        offset,
        startDate: `${finalStartDate} 00:00:00`,
        endDate: `${finalEndDate} 23:59:59`,
        provinceId,
      };

      const pivotColsQuery = `
            SELECT GROUP_CONCAT(
                DISTINCT CONCAT(
                    'SUM(CASE WHEN wc.waste_type_id = ''',
                    wc.waste_type_id,
                    ''' THEN wb.weight_in_kgs ELSE 0 END) AS \`',
                    wc.waste_type_id, '_', wt.name, '\`'
                )
                ORDER BY wt.name
            ) AS cols
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0 AND wt.is_active = 1
              AND wb.created_at BETWEEN :startDate AND :endDate
              AND wb.province_id = :provinceId
        `;

      const [{ cols: pivotCols = '' }] = (await sequelize.query(pivotColsQuery, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { cols: string }[];

      const sql = `
            SELECT wb.regency_id AS cityId,
                   wb.regency_name AS cityName,
                   wb.province_id AS provinceId,
                   SUM(IFNULL(wb.weight_in_kgs,0)) AS totalWeight,
                   COUNT(wb.id) AS totalWasteBag,
                   ${pivotCols || '0 AS dummy_col'}
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0
              AND wb.created_at BETWEEN :startDate AND :endDate
              AND wb.province_id = :provinceId
            GROUP BY wb.regency_id
            LIMIT :limit OFFSET :offset
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const countSql = `
            SELECT COUNT(DISTINCT wb.regency_id) AS total
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0
              AND wb.created_at BETWEEN :startDate AND :endDate
              AND wb.province_id = :provinceId
        `;

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
      console.error('Error in getSummaryWasteHierarchyByProvince:', error);
      throw new Error('Database error');
    }
  }

  async getSummaryWasteHierarchyByCity(
    limit: number,
    page: number,
    token: string,
    cityId: number,
    startDate?: string,
    endDate?: string,
    healthcareFacilityId?: number,
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
      const offset = (safePage - 1) * safeLimit;

      // default date = today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const finalStartDate = startDate || todayStr;
      const finalEndDate = endDate || todayStr;

      const replacements: Record<string, any> = {
        limit: safeLimit,
        offset,
        cityId,
        startDate: `${finalStartDate} 00:00:00`,
        endDate: `${finalEndDate} 23:59:59`,
      };

      if (healthcareFacilityId) {
        replacements.healthcareFacilityId = healthcareFacilityId;
      }

      const pivotColsQuery = `
            SELECT GROUP_CONCAT(
                DISTINCT CONCAT(
                    'SUM(CASE WHEN wc.waste_type_id = ''',
                    wc.waste_type_id,
                    ''' THEN wb.weight_in_kgs ELSE 0 END) AS \`',
                    wc.waste_type_id, '_', wt.name, '\`'
                )
                ORDER BY wt.name
            ) AS cols
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0 AND wt.is_active = 1
              AND wb.created_at BETWEEN :startDate AND :endDate
              AND wb.regency_id = :cityId
              ${healthcareFacilityId ? 'AND wb.healthcare_facility_id = :healthcareFacilityId' : ''}
        `;

      const [{ cols: pivotCols = '' }] = (await sequelize.query(pivotColsQuery, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { cols: string }[];

      const sql = `
            SELECT wb.healthcare_facility_id AS healthcareFacilityId,
                   wb.healthcare_facility_name AS healthcareName,
                   wb.province_id AS provinceId,
                   wb.regency_id AS cityId,
                   SUM(IFNULL(wb.weight_in_kgs,0)) AS totalWeight,
                   COUNT(wb.id) AS totalWasteBag,
                   ${pivotCols || '0 AS dummy_col'}
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0
              AND wb.created_at BETWEEN :startDate AND :endDate
              AND wb.regency_id = :cityId
              ${healthcareFacilityId ? 'AND wb.healthcare_facility_id = :healthcareFacilityId' : ''}
            GROUP BY wb.healthcare_facility_id
            LIMIT :limit OFFSET :offset
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const countSql = `
            SELECT COUNT(DISTINCT wb.healthcare_facility_id) AS total
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            WHERE wt.level = 0
              AND wb.weight_in_kgs > 0
              AND wb.created_at BETWEEN :startDate AND :endDate
              AND wb.regency_id = :cityId
              ${healthcareFacilityId ? 'AND wb.healthcare_facility_id = :healthcareFacilityId' : ''}
        `;

      const [{ total = 0 }] = (await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      const typedData = data as DashboardWasteHierarchy[];

      return {
        data: typedData,
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getSummaryWasteHierarchyByCity:', error);
      throw new Error('Database error');
    }
  }

  async getWasteGroupByAdminHealthcareFacility(
    limit: number,
    page: number,
    token: string,
    wasteTypeId?: number,
    healthcareFacilityId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    wasteStatus?: string,
    search?: string,
  ): Promise<{
    data: DashboardHealthcare[];
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

      const replacements: Record<string, any> = {
        limit: safeLimit,
        offset,
      };

      const whereClauses: string[] = [];

      if (wasteTypeId) {
        whereClauses.push(`wc.waste_type_id = :wasteTypeId`);
        replacements.wasteTypeId = wasteTypeId;
      }

      if (healthcareFacilityId) {
        whereClauses.push(`wb.healthcare_facility_id = :healthcareFacilityId`);
        replacements.healthcareFacilityId = healthcareFacilityId;
      }

      if (wasteGroupId) {
        whereClauses.push(`wc.waste_group_id = :wasteGroupId`);
        replacements.wasteGroupId = wasteGroupId;
      }

      if (wasteCharacteristicsId) {
        whereClauses.push(`wc.waste_characteristics_id = :wasteCharacteristicsId`);
        replacements.wasteCharacteristicsId = wasteCharacteristicsId;
      }

      if (wasteStatus) {
        whereClauses.push(`wb.waste_status = :wasteStatus`);
        replacements.wasteStatus = wasteStatus;
      }

      if (search) {
        whereClauses.push(
          `CONCAT(wb.id, '-', DATE_FORMAT(wb.created_at, '%d-%m-%Y')) LIKE :search`,
        );
        replacements.search = `%${search}%`;
      }

      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const sql = `
            SELECT
                case when wb.waste_treatment_group_id is not null then wtg.group_id else
                wteg.group_id  end "wasteGroupNumber",
                c.name AS wasteTypeName,
                d.name AS wasteGroupName,
                e.name AS wasteCharacteristicsName,
                c.name_en AS wasteTypeNameEn,
                d.name_en AS wasteGroupNameEn,
                e.name_en AS wasteCharacteristicsNameEn,
                CASE
                    WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
                    WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN ws.internal_treatment_name
                    ELSE ws.external_healthcare_facility_name
                END AS wasteSource,
                wb.created_at AS wasteInDate,
                wb.max_storage_hours AS storageDateLimit,
                SUM(wb.weight_in_kgs) AS totalWeightInKgs,
                NULL AS lastFollowUp,
                wb.waste_status AS wasteStatus,
                wc.disposal_method disposalMethod,
                wb.healthcare_facility_id AS healthcareFacilityId,
                wc.waste_type_id AS wasteTypeId,
                wc.waste_group_id AS wasteGroupId,
                wc.waste_characteristics_id AS wasteCharacteristicsId,
                wteg.transporter_operator_id "transporterOperatorId",
                wteg.treatment_operator_id "treatmentOperatorId",
                case when wb.waste_treatment_group_id is not null then wb.waste_treatment_group_id else
                    wb.waste_treatment_external_group_id  end "groupId",
                case when wb.waste_treatment_group_id is not null then "IN" else
                    "EX" end "treatmentType"
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy c ON c.id = wc.waste_type_id
            JOIN waste_hierarchy d ON d.id = wc.waste_group_id
            JOIN waste_hierarchy e ON e.id = wc.waste_characteristics_id
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            LEFT JOIN waste_treatment_group wtg ON wtg.id = wb.waste_treatment_group_id
            LEFT JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id
            ${whereSQL}
            GROUP BY wb.waste_treatment_external_group_id, wb.waste_treatment_group_id, wb.healthcare_facility_id
            LIMIT :limit OFFSET :offset;
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const typedData = data as DashboardHealthcare[];
      const transporterOperatorIds = [...new Set(typedData.map((d) => d.transporterOperatorId))];
      const treatmentOperatorIds = [...new Set(typedData.map((d) => d.treatmentOperatorId))];

      const [operatorEntities, treatmentEntities] = await Promise.all([
        Promise.all(
          transporterOperatorIds.map((id) => String(id)).map((id) => getUsersDetail(id, token)),
        ),
        Promise.all(
          treatmentOperatorIds.map((id) => String(id)).map((id) => getUsersDetail(id, token)),
        ),
      ]);

      const transporterOperatorMap = Object.fromEntries(
        operatorEntities.filter(Boolean).map((e) => [e.user_uuid, e]),
      );
      const treatmentOperatorMap = Object.fromEntries(
        treatmentEntities.filter(Boolean).map((e) => [e.user_uuid, e]),
      );

      const enrichedData = typedData.map((item) => {
        const transporterOperator =
          item.transporterOperatorId !== undefined
            ? transporterOperatorMap[String(item.transporterOperatorId)] || null
            : null;

        const treatmentOperator =
          item.treatmentOperatorId !== undefined
            ? treatmentOperatorMap[String(item.treatmentOperatorId)] || null
            : null;

        return {
          ...item,
          transporterOperatorName: transporterOperator?.firstname ?? null,
          treatmentOperatorName: treatmentOperator?.firstname ?? null,
        };
      });

      const countSql = `
            SELECT COUNT(DISTINCT CONCAT(
                IFNULL(wb.waste_treatment_external_group_id, 'extnull'), '-',
                IFNULL(wb.waste_treatment_group_id, 'grpnull'), '-',
                wb.healthcare_facility_id
            )) AS total
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy c ON c.id = wc.waste_type_id
            JOIN waste_hierarchy d ON d.id = wc.waste_group_id
            JOIN waste_hierarchy e ON e.id = wc.waste_characteristics_id
            JOIN waste_source ws ON ws.id = wb.waste_source_id
            ${whereSQL};
        `;

      const [{ total = 0 }] = (await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      return {
        data: enrichedData,
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getWasteBagSummary:', error);
      throw new Error('Database error');
    }
  }

  async getWasteGroupByTransporter(
    limit: number,
    page: number,
    token: string,
    entityId: number,
    healthcareFacilityId?: number,
    provinceId?: number,
    cityId?: number,
    startDate?: string,
    endDate?: string,
    search?: string,
  ): Promise<{
    data: DashboardThirdParty[];
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

      const replacements: Record<string, any> = {
        limit: safeLimit,
        offset,
      };

      const whereClauses: string[] = [];
      whereClauses.push(`wb.transporter_id = :entityId`);
      replacements.entityId = entityId;

      if (healthcareFacilityId) {
        whereClauses.push(`wb.healthcare_facility_id = :healthcareFacilityId`);
        replacements.healthcareFacilityId = healthcareFacilityId;
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
        whereClauses.push(`wteg.created_at BETWEEN :startDate AND :endDate`);
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }

      if (search) {
        whereClauses.push(`
                    (
                        wb.healthcare_facility_name LIKE :search OR
                        wteg.group_id LIKE :search OR
                        ut.firstname LIKE :search OR
                        pv.vehicle_number LIKE :search
                    )
                `);
        replacements.search = `%${search}%`;
      }

      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const sql = `
            SELECT wteg.id "wasteGroupId", wteg.group_id AS wasteGroupNumber,
            wb.healthcare_facility_id "healthcareFacilityId", wteg.total_weight_in_kgs "totalWeightInKgs",
            wteg.transporter_operator_id "transporterOperatorId", COALESCE(pvwteg.vehicle_number, pv.vehicle_number) AS "vehicleNumber",
            wteg.treatment_operator_id "treatmentOperatorId", wb.province_id "provinceId", wb.regency_id "cityId",
            wb.healthcare_facility_name "healthcareName", wb.manifest_doc_number "manifestNumber",
            ut.firstname AS transporterOperatorName,
            wteg.updated_at "handOverTime"
            FROM waste_bag wb
            JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id and wteg.transportation_status = "IN_TRANSIT"
            JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
            LEFT JOIN partner_vehicle pvwteg ON pvwteg.id = wteg.transporter_vehicle_id
            LEFT JOIN users ut ON ut.user_uuid = wteg.transporter_operator_id
            ${whereSQL}
            GROUP BY wb.waste_transportation_external_group_id, wb.healthcare_facility_id
            LIMIT :limit OFFSET :offset;
        `;

      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const typedData = data as DashboardThirdParty[];

      const countSql = `
            SELECT count(*) AS total from (
            SELECT wteg.id
            FROM waste_bag wb
            JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id and wteg.transportation_status = "IN_TRANSIT"
            JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
            LEFT JOIN users ut ON ut.user_uuid = wteg.transporter_operator_id
            ${whereSQL}
            GROUP BY wb.waste_transportation_external_group_id, wb.healthcare_facility_id) a;
        `;

      const [{ total = 0 }] = (await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      return {
        data: typedData,
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getWasteGroupByTransporter:', error);
      throw new Error('Database error');
    }
  }

  async getWasteGroupByTreatmentAll(
    limit: number,
    page: number,
    token: string,
    entityId: number,
    disposalTreatment: string,
    healthcareFacilityId?: number,
    provinceId?: number,
    cityId?: number,
    startDate?: string,
    endDate?: string,
    search?: string,
  ): Promise<{
    data: DashboardThirdParty[];
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

      const replacements: Record<string, any> = {
        limit: safeLimit,
        offset,
      };

      const whereClauses: string[] = [];
      let wasteTreatmeantExternal = ``;
      if (healthcareFacilityId) {
        whereClauses.push(`wb.healthcare_facility_id = :healthcareFacilityId`);
        replacements.healthcareFacilityId = healthcareFacilityId;
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
          `CONVERT_TZ(wteg.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`,
        );
        replacements.startDate = `${startDate} 00:00:00`;
        replacements.endDate = `${endDate} 23:59:59`;
      }
      let attributesSelect = ``;
      if (disposalTreatment === 'TREATMENT') {
        whereClauses.push(`p.provider_type IN (:providerType)`);
        whereClauses.push('wb.waste_status IN (:wasteStatuse)');
        replacements.wasteStatuse = ['RECYCLED', 'LANDFILLED'];
        replacements.providerType = ['TREATMENT'];
        whereClauses.push(`wb.third_party_id = :entityId`);
        replacements.entityId = entityId;
        wasteTreatmeantExternal = `JOIN waste_treatment_external_group wtrg on wtrg.id = wb.waste_treatment_external_group_id
                LEFT JOIN users u ON u.user_uuid = wtrg.treatment_operator_id`;
        attributesSelect = `,u.firstname treatmentOperatorName, DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z') handOverTime`;
      } else if (disposalTreatment === 'LANDFILLER') {
        whereClauses.push(`wb.waste_status = :wasteStatus`);
        replacements.wasteStatus = 'LANDFILLED';
        whereClauses.push(`p.provider_type IN (:providerType)`);
        replacements.providerType = ['LANDFILLER'];
        whereClauses.push(`wb.third_party_id = :entityId`);
        replacements.entityId = entityId;
        wasteTreatmeantExternal = `JOIN waste_treatment_external_group wtrg on wtrg.id = wb.waste_treatment_external_group_id
                LEFT JOIN users u ON u.user_uuid = wtrg.treatment_operator_id`;
        attributesSelect = `,u.firstname treatmentOperatorName, DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z') handOverTime`;
      } else if (disposalTreatment === 'RECYCLER') {
        whereClauses.push(`wb.waste_status = :wasteStatus`);
        replacements.wasteStatus = 'RECYCLED';
        whereClauses.push(`p.provider_type IN (:providerType)`);
        replacements.providerType = ['TRANSPORTER_RECYCLER', 'RECYCLER'];
        whereClauses.push(`wb.transporter_id = :entityId`);
        replacements.entityId = entityId;
        attributesSelect = `,ut.firstname treatmentOperatorName, DATE_FORMAT(CONVERT_TZ(wteg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z') handOverTime`;
      } else if (disposalTreatment === 'SPECIALIZED') {
        whereClauses.push('wb.waste_status IN (:wasteStatuse)');
        replacements.wasteStatuse = ['COLLECTED'];
        whereClauses.push(`p.provider_type IN (:providerType)`);
        replacements.providerType = ['SPECIALIZED_TREATMENT_PROVIDER', 'TREATMENT'];
        whereClauses.push(`wb.transporter_id = :entityId`);
        replacements.entityId = entityId;
        attributesSelect = `,ut.firstname treatmentOperatorName, DATE_FORMAT(CONVERT_TZ(wteg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z') handOverTime`;
      } else if (disposalTreatment === 'GOVERNMENT') {
        whereClauses.push('wb.waste_status IN (:wasteStatuse)');
        replacements.wasteStatuse = ['DISPOSED'];
        whereClauses.push(`p.provider_type IN (:providerType)`);
        replacements.providerType = ['TRANSPORTER_GOVERNMENT', 'TREATMENT'];
        whereClauses.push(`wb.transporter_id = :entityId`);
        replacements.entityId = entityId;
        attributesSelect = `,ut.firstname treatmentOperatorName, DATE_FORMAT(CONVERT_TZ(wteg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z') handOverTime`;
      } else if (disposalTreatment === 'GOVERNMENT_WASTE_BANK') {
        whereClauses.push('wb.waste_status IN (:wasteStatuse)');
        replacements.wasteStatuse = ['DISPOSED'];
        whereClauses.push(`p.provider_type IN (:providerType)`);
        replacements.providerType = ['TREATMENT', 'LANDFILLER', 'RECYCLER'];
        whereClauses.push(`wb.third_party_id = :entityId`);
        replacements.entityId = entityId;
        wasteTreatmeantExternal = `JOIN waste_treatment_external_group wtrg on wtrg.id = wb.waste_treatment_external_group_id
                LEFT JOIN users u ON u.user_uuid = wtrg.treatment_operator_id`;
        attributesSelect = `,u.firstname treatmentOperatorName, DATE_FORMAT(CONVERT_TZ(wtrg.updated_at, '+00:00', '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z') handOverTime`;
      }
      if (search) {
        whereClauses.push(`
                    (
                        wb.healthcare_facility_name LIKE :search OR
                        wteg.group_id LIKE :search OR
                        ut.firstname LIKE :search OR
                        pv.vehicle_number LIKE :search
                    )
                `);
        replacements.search = `%${search}%`;
      }

      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const sql = `
            SELECT wteg.id "wasteGroupId", wteg.group_id AS wasteGroupNumber,
            wb.healthcare_facility_id "healthcareFacilityId", wteg.total_weight_in_kgs "totalWeightInKgs",
            wteg.transporter_operator_id "transporterOperatorId", pv.vehicle_number "vehicleNumber",
            wb.province_id "provinceId", wb.regency_id "cityId",
            wb.manifest_doc_number "manifestNumber", wb.healthcare_facility_name "healthcareName",
            ut.firstname AS transporterOperatorName,
            et.name AS transporterName , e.name AS thirdPartyName
            ${attributesSelect}
            FROM waste_bag wb
            JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id and wteg.transportation_status = "IN_TRANSIT"
            JOIN partnership p ON p.provider_id = wb.third_party_id AND p.partnership_status = 'ACTIVE' 
            JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
            ${wasteTreatmeantExternal}
            LEFT JOIN users ut ON ut.user_uuid = wteg.transporter_operator_id
            LEFT JOIN entities et ON et.id = wb.transporter_id
            LEFT JOIN entities e ON e.id = wb.third_party_id
            ${whereSQL}
            GROUP BY wb.waste_transportation_external_group_id, wb.healthcare_facility_id
            LIMIT :limit OFFSET :offset;
        `;
      const data = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const typedData = data as DashboardThirdParty[];
      const countSql = `
            SELECT COUNT(DISTINCT CONCAT(wb.waste_transportation_external_group_id, '-', wb.healthcare_facility_id)) AS total
            FROM waste_bag wb
            JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id and wteg.transportation_status = "IN_TRANSIT"
            JOIN partnership p ON p.provider_id = wb.third_party_id AND p.partnership_status = 'ACTIVE'
            JOIN partner_vehicle pv ON pv.transporter_id = wb.transporter_id AND pv.entity_id = wb.healthcare_facility_id
            ${wasteTreatmeantExternal}
            ${whereSQL};
        `;

      const [{ total = 0 }] = (await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      return {
        data: typedData,
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getWasteGroupByTransporter:', error);
      throw new Error('Database error');
    }
  }

  async getWasteGroupDetailsByAction(
    limit: number,
    page: number,
    wasteGroupId: number,
    treatmentType: string,
  ): Promise<{
    data: DashboardWasteGroupDetailsByAction[];
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

      const whereClause =
        treatmentType === 'IN'
          ? 'wb.waste_treatment_external_group_id = :wasteGroupId'
          : 'wb.waste_transportation_external_group_id = :wasteGroupId';

      const baseQuery = `
            FROM waste_bag wb
            JOIN waste_bag_audit_trail wba
                ON wba.waste_bag_id = wb.waste_bag_qr_code_id
            WHERE ${whereClause}
              AND wba.is_group = 1
            GROUP BY wb.waste_transportation_external_group_id, wba.waste_bag_status
            ORDER BY wba.created_at ASC
        `;

      const dataSql = `
            SELECT
                wba.waste_bag_status AS "wasteBagStatus",
                MAX(wba.created_at) AS "updatedAtStatus"
            ${baseQuery}
            LIMIT :limit OFFSET :offset
        `;

      const countSql = `
            SELECT COUNT(*) AS total
            FROM (
                SELECT 1
                ${baseQuery}
            ) AS sub
        `;

      const replacements = {
        wasteGroupId,
        limit: safeLimit,
        offset,
      };

      const data = await sequelize.query(dataSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const [{ total = 0 }] = (await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      })) as { total: number }[];

      return {
        data: data as DashboardWasteGroupDetailsByAction[],
        pagination: {
          total,
          pages: Math.ceil(total / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error in getWasteGroupDetailsByAction:', error);
      throw new Error('Database error');
    }
  }

  async getWasteCharacteristicsSummary(
    wasteTypeId: number,
    provinceId?: number,
    cityId?: number,
    startDate?: string,
    endDate?: string,
    healthcareFacilityId?: number,
  ): Promise<{ data: DashboardWasteCharacteristicsSummary[] }> {
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }

    try {
      const whereClauses: string[] = [];
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const finalStartDate = startDate || todayStr;
      const finalEndDate = endDate || todayStr;
      const replacements: Record<string, any> = {
        wasteTypeId,
        startDate: `${finalStartDate} 00:00:00`,
        endDate: `${finalEndDate} 23:59:59`,
      };

      whereClauses.push('wc.waste_type_id = :wasteTypeId');
      whereClauses.push('wb.created_at BETWEEN :startDate AND :endDate');

      if (provinceId) {
        whereClauses.push('el.province_id = :provinceId');
        replacements.provinceId = provinceId;
      }
      if (cityId) {
        whereClauses.push('el.city_id = :cityId');
        replacements.cityId = cityId;
      }
      if (healthcareFacilityId) {
        whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
        replacements.healthcareFacilityId = healthcareFacilityId;
      }

      const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const dataSql = `
            SELECT
                wg.name AS wasteGroupName,
                wch.name AS wasteCharacteristicsName,
                wc.waste_code AS wasteCode,
                COUNT(*) AS totalWasteBag,
                SUM(wb.weight_in_kgs) AS totalWeight
            FROM waste_bag wb
            JOIN waste_classification wc
                ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wg
                ON wg.id = wc.waste_group_id
            JOIN waste_hierarchy wch
                ON wch.id = wc.waste_characteristics_id
            JOIN entity_location el
                ON el.entity_id = wb.healthcare_facility_id
            ${whereSQL}
            GROUP BY wc.waste_characteristics_id, wc.waste_group_id, wc.waste_code, wg.name, wch.name
        `;

      const data = await sequelize.query(dataSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return {
        data: data as DashboardWasteCharacteristicsSummary[],
      };
    } catch (error) {
      console.error('Error in getWasteGroupDetailsByAction:', error);
      throw new Error('Database error');
    }
  }
}
