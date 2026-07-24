import { Op, QueryTypes, UniqueConstraintError } from 'sequelize';
import WasteBag from '../../../domain/entities/WasteBag';
import Partnership from '../../../domain/entities/Partnership';
import { UserInfo } from '../../../shared/types/userInfo';
import AssetModelSeq from '../models/AssetModel';
import { HealthcareFacilityAssetModel } from '../models/HealthcareFacilityAssetModel';
import WasteBagModel, { WasteBagModelAttributes } from '../models/WasteBagModel';
import WasteBagRepository from './../../../domain/repositories/WasteBagRepository';
import InfraRegistry from './infraRegistry';
import { paginationUtils } from '../../../shared/utils/pagination';
import { WasteTransportationGroupAttributes } from '../../../infrastructure/database/models/WasteTransportationGroupModel';
import { WasteBagTreatmentGroupModelAttributes } from '../../../infrastructure/database/models/WasteBagTreatmentGroupModel';
import { WasteClassificationAttributes } from '../models/WasteClassificationModel';
import WasteClassificationModel from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../../../infrastructure/database/models/WasteHierarchyModel';
import { WasteSourceAttributes } from '../../../infrastructure/database/models/WasteSourceModel';
import WasteSourceModel from '../../../infrastructure/database/models/WasteSourceModel';
import { WasteBagTreatmentGroupModel } from '../models/WasteBagTreatmentGroupModel';
import WasteTransportationGroupModel from '../../../infrastructure/database/models/WasteTransportationGroupModel';
import { WasteTreatmentExternalGroupModel } from '../models/WasteTreatmentExternalGroupModel';
import WasteTransportationExternalGroupModel from '../../../infrastructure/database/models/WasteTransportationExternalGroupModel';
import { WasteTreatmentExternalGroupModelAttributes } from '../../../infrastructure/database/models/WasteTreatmentExternalGroupModel';
import { WasteTransportationExternalGroupAttributes } from '../../../infrastructure/database/models/WasteTransportationExternalGroupModel';
import { getEntityDetail } from '../../external-apis/thirdPartyClient';
import { handleAnalisisProcessCount } from '../../../shared/utils/countProsessEvent';
import { getLogHistories } from '../../../shared/utils/logHistories';
import { formatTitleCase } from '../../../shared/utils/formating';
import DisposalModel from '../models/DisposalModel';
import HealthcareAssetModel from '../models/HealthcareAssetModel';
import { fromZonedTime } from 'date-fns-tz';
import { sequelize } from '../db.connection';

export default class WasteBagRepositoryImpl implements WasteBagRepository {
  async getAllWasteBag(
    limit: number,
    page: number,
    search?: string,
    healthcareId?: number,
    transporterId?: number,
    thirdPartyId?: number,
    wasteUpdateStart?: string,
    wasteUpdateEnd?: string,
    wasteClassificationId?: number[],
    transportationGroupId?: number,
    transportationExternalGroupId?: number,
    treatmentGroupId?: number,
    treatmentExternalGroupId?: number,
    sourceType?: string,
    ownedBy?: string,
    wasteStatus?: string,
    binNumber?: string,
    wasteBagQrCodeId?: string,
    id?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    isTreated?: boolean,
    isDisposed?: boolean,
    entityTag?: string,
    entityId?: number,
    isHomePage?: boolean,
    isLoggerHistory?: boolean,
  ): Promise<{
    data: WasteBag[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      if (!entityTag) {
        throw new Error('Authorization error');
      }

      const currentTag = entityTag?.toLowerCase();
      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
        maxLimit: 1000,
      });

      // Build raw SQL WHERE conditions dynamically
      const conditions: string[] = [];
      const replacements: Record<string, any> = {};

      if (currentTag.includes('hospital')) {
        conditions.push('wb.healthcare_facility_id = :entityId');
      } else {
        conditions.push('(wb.third_party_id = :entityId OR wb.transporter_id = :entityId)');
      }
      replacements.entityId = entityId;

      if (wasteUpdateStart && wasteUpdateEnd) {
        const tz = process.env.TIME_ZONE || 'Asia/Jakarta';
        replacements.startDate = fromZonedTime(`${wasteUpdateStart} 00:00:00`, tz);
        replacements.endDate = fromZonedTime(`${wasteUpdateEnd} 23:59:59`, tz);
        conditions.push('wb.created_at >= :startDate AND wb.created_at <= :endDate');
      }

      if (wasteClassificationId && wasteClassificationId.length > 0) {
        conditions.push('wb.waste_classification_id IN (:wasteClassificationIds)');
        replacements.wasteClassificationIds = wasteClassificationId;
      }

      if (transportationGroupId) {
        conditions.push('wb.waste_transportation_group_id = :transportationGroupId');
        replacements.transportationGroupId = transportationGroupId;
      }

      if (transportationExternalGroupId) {
        conditions.push('wb.waste_transportation_external_group_id = :transportationExternalGroupId');
        replacements.transportationExternalGroupId = transportationExternalGroupId;
      }

      if (treatmentGroupId) {
        conditions.push('wb.waste_treatment_group_id = :treatmentGroupId');
        replacements.treatmentGroupId = treatmentGroupId;
      }

      if (treatmentExternalGroupId) {
        conditions.push('wb.waste_treatment_external_group_id = :treatmentExternalGroupId');
        replacements.treatmentExternalGroupId = treatmentExternalGroupId;
      }

      if (ownedBy) {
        conditions.push('wb.owned_by = :ownedBy');
        replacements.ownedBy = ownedBy;
      }

      if (wasteStatus) {
        conditions.push('wb.waste_status IN (:wasteStatuses)');
        replacements.wasteStatuses = wasteStatus.split(',');
      }

      if (isTreated) conditions.push('wb.is_treated = 1');
      if (isDisposed) conditions.push('wb.is_disposed = 1');

      if (binNumber) {
        conditions.push('wb.bin_number = :binNumber');
        replacements.binNumber = binNumber;
      }

      if (wasteBagQrCodeId) {
        conditions.push('wb.waste_bag_qr_code_id = :wasteBagQrCodeId');
        replacements.wasteBagQrCodeId = wasteBagQrCodeId;
      }

      if (search) {
        conditions.push('wb.waste_bag_qr_code_id LIKE :search');
        replacements.search = `%${search}%`;
      }

      if (id) {
        conditions.push('wb.id = :id');
        replacements.id = id;
      }

      if (sourceType) {
        conditions.push('ws.source_type = :sourceType');
        replacements.sourceType = sourceType;
      }

      if (wasteTypeId) {
        conditions.push('wt.id = :wasteTypeId');
        replacements.wasteTypeId = wasteTypeId;
      }

      if (wasteGroupId) {
        conditions.push('wg.id = :wasteGroupId');
        replacements.wasteGroupId = wasteGroupId;
      }

      if (wasteCharacteristicsId) {
        conditions.push('wch.id = :wasteCharacteristicsId');
        replacements.wasteCharacteristicsId = wasteCharacteristicsId;
      }

      const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const baseJoinSql = `
        FROM waste_bag wb
        INNER JOIN waste_source ws ON ws.id = wb.waste_source_id
        INNER JOIN waste_classification wc ON wc.id = wb.waste_classification_id
        INNER JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
        INNER JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
        INNER JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
      `;

      const [countResult, paginatedRows] = await Promise.all([
        sequelize.query(`SELECT COUNT(DISTINCT wb.id) AS total ${baseJoinSql} ${whereSql}`, {
          replacements,
          type: QueryTypes.SELECT,
        }),
        sequelize.query(
          `SELECT wb.id ${baseJoinSql} ${whereSql} GROUP BY wb.id ORDER BY wb.updated_at DESC LIMIT :limit OFFSET :offset`,
          {
            replacements: { ...replacements, limit: safeLimit, offset: (safePage - 1) * safeLimit },
            type: QueryTypes.SELECT,
          },
        ),
      ]);

      const count = Number((countResult as any[])[0]?.total ?? 0);
      const paginatedIds = (paginatedRows as any[]).map((r) => r.id);

      if (count === 0 || paginatedIds.length === 0) {
        return {
          data: [],
          pagination: { total: 0, pages: 0, currentPage: safePage, perPage: safeLimit },
        };
      }

      const dataRows = await sequelize.query(
        `SELECT
          wb.id, wb.healthcare_facility_id, wb.created_at, wb.created_by, wb.updated_by,
          wb.is_disposed, wb.is_treated, wb.waste_source_id, wb.waste_classification_id,
          wb.scale_method, wb.weight_in_kgs, wb.waste_bag_qr_code_id, wb.waste_status,
          wb.owned_by, wb.waste_status_updated_at, wb.waste_status_updated_by,
          wb.transportation_status, wb.transportation_status_updated_at,
          wb.transportation_status_updated_by, wb.storage_start_timestamp,
          wb.scheduled_storage_end_datetime, wb.actual_storage_end_timestamp,
          wb.max_storage_hours, wb.min_storage_hours, wb.waste_treatment_group_id,
          wb.waste_transportation_group_id, wb.waste_treatment_external_group_id,
          wb.waste_transportation_external_group_id, wb.bin_number, wb.iot_method,
          wb.manifest_doc_number, wb.manifest_doc_path, wb.treatment_start_time,
          wb.treatment_end_time, wb.waste_group_ids, wb.treatment_location_id,
          ws.id AS ws__id,
          ws.healthcare_facility_id AS ws__healthcare_facility_id,
          ws.source_type AS ws__source_type,
          ws.internal_source_name AS ws__internal_source_name,
          ws.internal_treatment_name AS ws__internal_treatment_name,
          ws.external_healthcare_facility_id AS ws__external_healthcare_facility_id,
          ws.external_healthcare_facility_name AS ws__external_healthcare_facility_name,
          ws.is_active AS ws__is_active,
          ws.is_residue AS ws__is_residue,
          wc.id AS wc__id, wc.region_id AS wc__region_id,
          wc.effective_from AS wc__effective_from, wc.effective_to AS wc__effective_to,
          wc.waste_type_id AS wc__waste_type_id, wc.waste_group_id AS wc__waste_group_id,
          wc.waste_characteristics_id AS wc__waste_characteristics_id,
          wc.waste_code AS wc__waste_code, wc.waste_bag_color_code AS wc__waste_bag_color_code,
          wc.storage_rule_type AS wc__storage_rule_type,
          wc.use_cold_storage AS wc__use_cold_storage,
          wc.cold_storage_min_hours AS wc__cold_storage_min_hours,
          wc.cold_storage_max_hours AS wc__cold_storage_max_hours,
          wc.temp_storage_min_hours AS wc__temp_storage_min_hours,
          wc.temp_storage_max_hours AS wc__temp_storage_max_hours,
          wc.minimun_decay_day AS wc__minimun_decay_day,
          wc.storage_rule AS wc__storage_rule,
          wc.allow_healthcare_facility_treatment AS wc__allow_healthcare_facility_treatment,
          wc.is_active AS wc__is_active,
          wc.has_multiple_transporters AS wc__has_multiple_transporters,
          wc.treatment_method AS wc__treatment_method,
          wc.disposal_method AS wc__disposal_method,
          wc.allowed_vehicle_types AS wc__allowed_vehicle_types,
          wt.id AS wt__id, wt.name AS wt__name,
          wt.name_en AS wt__name_en,
          wt.parent_hierarchy_id AS wt__parent_hierarchy_id,
          wg.id AS wg__id, wg.name AS wg__name,
          wg.name_en AS wg__name_en,
          wg.parent_hierarchy_id AS wg__parent_hierarchy_id,
          wch.id AS wch__id, wch.name AS wch__name,
          wch.name_en AS wch__name_en,
          wch.is_residue AS wch__is_residue, wch.parent_hierarchy_id AS wch__parent_hierarchy_id,
          tg.id AS tg__id, tg.total_bags_count AS tg__total_bags_count,
          tg.total_weight_in_kgs AS tg__total_weight_in_kgs,
          tg.treatment_asset_id AS tg__treatment_asset_id,
          tg.treatment_operator_id AS tg__treatment_operator_id,
          tg.handover_lattitude AS tg__handover_lattitude,
          tg.handover_longitude AS tg__handover_longitude,
          tg.treatment_status AS tg__treatment_status,
          tg.is_read_only AS tg__is_read_only, tg.group_id AS tg__group_id,
          tag.id AS tag__id, tag.total_bags_count AS tag__total_bags_count,
          tag.total_weight_in_kgs AS tag__total_weight_in_kgs,
          tag.transporter_vehicle_id AS tag__transporter_vehicle_id,
          tag.transporter_operator_id AS tag__transporter_operator_id,
          tag.handover_lattitude AS tag__handover_lattitude,
          tag.handover_longitude AS tag__handover_longitude,
          tag.transportation_status AS tag__transportation_status,
          tag.is_read_only AS tag__is_read_only, tag.group_id AS tag__group_id,
          teg.id AS teg__id, teg.total_bags_count AS teg__total_bags_count,
          teg.total_weight_in_kgs AS teg__total_weight_in_kgs,
          teg.treatment_operator_id AS teg__treatment_operator_id,
          teg.transportation_status AS teg__transportation_status,
          teg.is_read_only AS teg__is_read_only, teg.group_id AS teg__group_id,
          taeg.id AS taeg__id, taeg.total_bags_count AS taeg__total_bags_count,
          taeg.transporter_id AS taeg__transporter_id,
          taeg.total_weight_in_kgs AS taeg__total_weight_in_kgs,
          taeg.transporter_vehicle_id AS taeg__transporter_vehicle_id,
          taeg.transporter_operator_id AS taeg__transporter_operator_id,
          taeg.handover_lattitude AS taeg__handover_lattitude,
          taeg.handover_longitude AS taeg__handover_longitude,
          taeg.transportation_status AS taeg__transportation_status,
          taeg.handover_timestamp AS taeg__handover_timestamp,
          taeg.is_read_only AS taeg__is_read_only, taeg.group_id AS taeg__group_id
        FROM waste_bag wb
        INNER JOIN waste_source ws ON ws.id = wb.waste_source_id
        INNER JOIN waste_classification wc ON wc.id = wb.waste_classification_id
        INNER JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
        INNER JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
        INNER JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
        LEFT JOIN waste_treatment_group tg ON tg.id = wb.waste_treatment_group_id
        LEFT JOIN waste_transportation_group tag ON tag.id = wb.waste_transportation_group_id
        LEFT JOIN waste_treatment_external_group teg ON teg.id = wb.waste_treatment_external_group_id
        LEFT JOIN waste_transportation_external_group taeg ON taeg.id = wb.waste_transportation_external_group_id
        WHERE wb.id IN (:paginatedIds)
        ORDER BY wb.updated_at DESC`,
        { replacements: { paginatedIds }, type: QueryTypes.SELECT },
      );

      const processedRows = await Promise.all(
        (dataRows as any[]).map(async (row) => {
          if (!isHomePage && row.wch__id === 54) {
            const currentDate = new Date();
            const endTime = row.scheduled_storage_end_datetime
              ? new Date(row.scheduled_storage_end_datetime)
              : null;
            if (endTime && currentDate < endTime) return null;
            if (!row.weight_in_kgs) return null;
          }

          if (row.manifest_doc_path) {
            row.manifest_doc_path =
              await InfraRegistry.s3FileServiceRepositoryImpl!.getPresignedUrl(
                row.manifest_doc_path,
              );
          }

          const logHistory = isLoggerHistory ? await getLogHistories(row.id) : [];
          return mapRawRowToWasteBag(row, logHistory);
        }),
      );
      console.log({ isLoggerHistory });

      const validRows = processedRows.filter((x): x is WasteBag => Boolean(x));

      return paginationUtils.formatPaginationResult(validRows, count, safeLimit, safePage);
    } catch (error) {
      console.error('Error fetching WasteBag by ID:', error);
      throw new Error('Database error: ' + error);
    }
  }

  async getListTreatment(
    wasteBagQrCodeIds: string[],
    entityId: number,
  ): Promise<{ label: string; value: string }[]> {
    try {
      const wasteBags = await WasteBagModel.findAll({
        where: {
          wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds },
          healthcareFacilityId: entityId,
        },
        attributes: ['wasteClassificationId', 'wasteStatus', 'isTreated', 'healthcareFacilityId'],
      });

      if (wasteBags.length === 0) {
        throw new Error('No waste bags found for the provided QR codes');
      }

      const wasteClassificationIds = [
        ...new Set(wasteBags.map((bag) => bag.dataValues.wasteClassificationId)),
      ];

      const wasteClassifications = await WasteClassificationModel.findAll({
        where: {
          id: { [Op.in]: wasteClassificationIds },
        },
        attributes: ['id', 'treatmentMethod', 'disposalMethod', 'useColdStorage'],
      });

      if (!wasteClassifications) {
        throw new Error('WasteClassifications not found');
      }

      const wasteClassificationMap = new Map(
        wasteClassifications.map((wc: any) => [wc.dataValues.id, wc]),
      );

      const treatmentMethods = new Map<string, { label: string; value: string }>();

      for (const wasteBag of wasteBags) {
        const classification = wasteClassificationMap.get(
          wasteBag.dataValues.wasteClassificationId as number,
        );

        if (!classification) {
          throw new Error(
            `WasteClassification not found for ID: ${wasteBag.dataValues.wasteClassificationId}`,
          );
        }

        const treatmentMethodsArray = classification.dataValues.treatmentMethod
          ? classification.dataValues.treatmentMethod.split(',').map((method: any) => method.trim())
          : [];

        const disposalMethodsArray = classification.dataValues.disposalMethod
          ? classification.dataValues.disposalMethod.split(',').map((method: any) => method.trim())
          : [];

        const { isTreated, wasteStatus, healthcareFacilityId } = wasteBag.dataValues;

        // Ambil semua asset new OPERATIONAL sekaligus
        const facilityAssetsNew = await HealthcareAssetModel.findAll({
          where: { healthcareFacilityId, status: 1, assetWorkingStatusName: 1 },
          attributes: ['id', 'assetTypeName'],
        });

        // Ambil semua asset OPERATIONAL sekaligus
        const facilityAssets = await HealthcareFacilityAssetModel.findAll({
          where: { healthcareFacilityId, assetStatus: 'OPERATIONAL' },
          attributes: ['id'],
          include: {
            model: AssetModelSeq,
            as: 'assetModel',
            attributes: ['asset_type'],
          },
        });

        const assetTypes = new Set(
          process.env.IS_ASSET_NEW === 'true'
            ? facilityAssetsNew.map((a) => a.dataValues.assetTypeName)
            : facilityAssets.map((a) => a.dataValues.assetModel.dataValues.asset_type),
        );

        const methodRequirement: Record<string, string> = {
          DISINFECTION: process.env.IS_ASSET_NEW === 'true' ? 'Waste Autoclave' : 'AUTOCLAVE',
          PYROLYSIS: process.env.IS_ASSET_NEW === 'true' ? 'Waste Incinerator' : 'INCINERATOR',
        };

        type MethodOption = { label: string; value: string };
        let treatmentMethodValue: MethodOption[] = [];

        treatmentMethodValue = treatmentMethodsArray
          .filter((method: string) => {
            const requiredAsset = methodRequirement[method];
            return !requiredAsset || assetTypes.has(requiredAsset);
          })
          .map((method: string) => ({
            label: formatTitleCase(method),
            value: method,
          }));

        const disposalMethodValue = disposalMethodsArray.map((v: string) => {
          const label = v
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return {
            label: label,
            value: v,
          };
        });

        const selectedOption = new Map<string, { label: string; value: string }>();

        if (isTreated) {
          disposalMethodValue.forEach((d: { label: string; value: string }) =>
            selectedOption.set(d.value, d),
          );
        } else {
          [...treatmentMethodValue, ...disposalMethodValue].forEach((opt) =>
            selectedOption.set(opt.value, opt),
          );
        }

        if (
          classification.dataValues.useColdStorage &&
          assetTypes.has(
            process.env.IS_ASSET_NEW === 'true' ? 'Waste Cold Storage' : 'COLD_STORAGE',
          )
        ) {
          selectedOption.set('COLD_STORAGE', {
            label: 'Cold Storage',
            value: 'COLD_STORAGE',
          });
        }

        selectedOption.forEach((m) => treatmentMethods.set(m.value, m));
      }

      return Array.from(treatmentMethods.values());
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data get failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error get Data: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while get Data');
      }
    }
  }

  async getWasteBagById(id: string): Promise<WasteBag | null> {
    try {
      const wasteBag = await WasteBagModel.findOne({
        where: {
          wasteBagQrCodeId: id,
        },
        include: [
          {
            model: WasteClassificationModel,
            as: 'wasteClassification',
            required: true,
            include: [
              {
                model: WasteHierarchyModel,
                as: 'wasteType',
                required: true,
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteGroup',
                required: true,
                attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
              },
              {
                model: WasteHierarchyModel,
                as: 'wasteCharacteristics',
                required: true,
                attributes: ['id', 'name', 'description', 'isActive', 'nameEn', 'descriptionEn'],
              },
            ],
          },
        ],
      });
      if (!wasteBag) {
        return null;
      }
      return getWasteBagFromModel(wasteBag, false);
    } catch (error) {
      console.error('Error fetching WasteBag by ID:', error);
      throw new Error('Database error');
    }
  }

  async getWasteBagsByIds(ids: string[]): Promise<WasteBagModel[] | null> {
    try {
      const wasteBags = await WasteBagModel.findAll({
        where: {
          wasteBagQrCodeId: { [Op.in]: ids },
        },
      });
      return wasteBags;
    } catch (error) {
      console.error('Error fetching WasteBag by ID:', error);
      throw new Error('Database error');
    }
  }

  async getWasteBagIdsByTransportGroupId(wasteBagTransportGroupId: number): Promise<string[]> {
    try {
      const wasteBagsIds = await WasteBagModel.findAll({
        where: {
          wasteTransportationGroupId: wasteBagTransportGroupId,
        },
        attributes: ['wasteBagQrCodeId'],
      });
      return wasteBagsIds.map((wasteBag) => wasteBag.wasteBagQrCodeId!);
    } catch (error) {
      console.error('Error fetching WasteBags by Transport Group ID:', error);
      throw new Error('Database error');
    }
  }

  async getWasteBagByWasteSourceId(wasteSourceId: number): Promise<number | undefined> {
    try {
      const wasteBagsIds = await WasteBagModel.findOne({
        where: {
          wasteSourceId: wasteSourceId,
        },
        attributes: ['id'],
      });

      return wasteBagsIds?.id;
    } catch (error) {
      console.error('Error fetching WasteBags by Transport Group ID:', error);
      throw new Error('Database error');
    }
  }

  async createWasteBag(
    wasteBag: WasteBag,
    token: string,
    isRadioActive: boolean,
  ): Promise<WasteBag | string> {
    try {
      if (
        !wasteBag.wasteBagQrCodeId ||
        !wasteBag.healthcareFacilityId ||
        !wasteBag.createdAt ||
        !wasteBag.createdBy ||
        !wasteBag.wasteSourceId ||
        !wasteBag.wasteClassificationId ||
        (isRadioActive === false && !wasteBag.scaleMethod) ||
        !wasteBag.wasteStatus ||
        !wasteBag.ownedBy ||
        wasteBag.isTreated === undefined ||
        wasteBag.isDisposed === undefined
      ) {
        return 'MISSING_FIELD';
      }

      if (wasteBag.scaleMethod === 'MANUAL') {
        const checkManualRequest =
          await InfraRegistry.manualScaleRequestRepositoryImpl!.getOneActiveRequest(
            wasteBag.createdBy,
          );

        if (!checkManualRequest) {
          return 'MANUAL_REQUEST_REJECT';
        }
      }

      let correctStatus: 'IN_COLD_STORAGE' | 'IN_TEMPORARY_STORAGE' = 'IN_TEMPORARY_STORAGE';

      if (wasteBag.wasteStatus === 'IN_COLD_STORAGE') {
        if (process.env.IS_ASSET_NEW === 'true') {
          const healthcareFacilityAsset = await HealthcareAssetModel.findOne({
            where: {
              healthcareFacilityId: wasteBag.healthcareFacilityId as number,
              status: 1,
              assetWorkingStatusName: 1,
              assetTypeName: 'Waste Cold Storage',
            },
          });

          if (!healthcareFacilityAsset) {
            correctStatus;
          } else {
            correctStatus = 'IN_COLD_STORAGE';
          }
        } else {
          const healthcareFacilityAsset = await HealthcareFacilityAssetModel.findOne({
            where: {
              healthcareFacilityId: wasteBag.healthcareFacilityId as number,
              assetStatus: 'OPERATIONAL',
            },
            include: {
              model: AssetModelSeq,
              as: 'assetModel',
              where: {
                asset_type: 'COLD_STORAGE',
              },
            },
          });

          if (!healthcareFacilityAsset) {
            correctStatus;
          } else {
            correctStatus = 'IN_COLD_STORAGE';
          }
        }
      }

      if (wasteBag.binNumber) {
        const findSameBin = await WasteBagModel.findOne({
          attributes: ['wasteClassificationId'],
          where: {
            binNumber: wasteBag.binNumber,
          },
        });

        if (
          findSameBin &&
          wasteBag.wasteClassificationId !== findSameBin.dataValues.wasteClassificationId
        ) {
          return `INVALID_BIN`;
        }
      }

      // add maximum time if waste classification is need cold storage
      const dataEntity = await getEntityDetail(wasteBag.healthcareFacilityId, token);

      const createModelObj = await WasteBagModel.create({
        healthcareFacilityId: wasteBag.healthcareFacilityId,
        createdAt: new Date(),
        createdBy: wasteBag.createdBy,
        wasteBagQrCodeId: wasteBag.wasteBagQrCodeId,
        wasteSourceId: wasteBag.wasteSourceId,
        sourceTreatmentGroupId: wasteBag.sourceTreatmentGroupId,
        wasteClassificationId: wasteBag.wasteClassificationId,
        storageStartTimestamp: new Date(),
        scheduledStorageEndDatetime: wasteBag.scheduledStorageEndDatetime,
        assetId: wasteBag.assetId,
        scaleMethod: wasteBag.scaleMethod ?? 'IOT',
        weightInKgs: wasteBag?.weightInKgs
          ? Number(parseFloat(wasteBag?.weightInKgs?.toString() ?? '').toFixed(3))
          : undefined,
        wasteStatus: correctStatus,
        ownedBy: wasteBag.ownedBy,
        isTreated: wasteBag.isTreated,
        isDisposed: wasteBag.isDisposed,
        binNumber: wasteBag.binNumber,
        iotMethod: wasteBag.iotMethod,
        wasteGroupIds: wasteBag.wasteGroupIds,
        healthcareFacilityName: dataEntity?.name,
        provinceId: dataEntity?.province_id,
        regencyId: dataEntity?.regency_id,
        districtId: dataEntity?.sub_district_id ? Number(dataEntity?.sub_district_id) : undefined,
        provinceName: dataEntity?.province_name ?? dataEntity?.locations?.[0]?.name,
        regencyName: dataEntity?.regency_name ?? dataEntity?.locations?.[1]?.name,
        districtName: dataEntity?.district_name ?? dataEntity?.locations?.[2]?.name,
        bastNo: wasteBag.bastNo,
        materialIds: wasteBag.materialIds,
      });

      const createdWasteBag = getWasteBagFromModel(createModelObj, false);

      //update isReadonly in waste group treatment
      if (wasteBag.wasteGroupIds) {
        await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.updateIsReadOnly(
          wasteBag.wasteGroupIds,
        );
      }

      return createdWasteBag;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating WasteBag: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating WasteBag');
      }
    }
  }

  async temporaryStoreWasteBag(
    wasteBagQrCodeIds: string[],
    updated_by: string,
  ): Promise<number | null | string> {
    try {
      const allRequestedWasteBags = await WasteBagModel.findAll({
        attributes: ['wasteClassificationId', 'weightInKgs'],
        where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
      });

      if (allRequestedWasteBags.length !== wasteBagQrCodeIds.length) {
        return 'NOT_FOUND';
      }

      const distinctWasteClassificationIds = new Set(
        allRequestedWasteBags.map((bag) => bag.get('wasteClassificationId') as number),
      );

      if (distinctWasteClassificationIds.size > 1) {
        return 'MIXED_CLASSIFICATION_NOT_ALLOWED';
      }

      const wasteClassification =
        await InfraRegistry.wasteClassificationRepositoryImpl!.getWasteClassificationById(
          allRequestedWasteBags[0].get('wasteClassificationId') as number,
        );

      if (!wasteClassification) {
        return 'WASTE_CLASSIFICATION_NOT_FOUND';
      }
      if (wasteClassification.tempStorageMaxHours === undefined) {
        return 'MAX_STORAGE_TIME_NOT_FOUND';
      }

      const wasteBagTreatmentGroupId =
        await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.createWasteBagTreatmentGroupFromBags(
          allRequestedWasteBags,
          wasteBagQrCodeIds,
          updated_by,
          'IN_TEMPORARY_STORAGE',
        );

      const storageStartTimestamp = new Date();
      const scheduledStorageEndDatetime = new Date(
        storageStartTimestamp.getTime() + wasteClassification.tempStorageMaxHours * 60 * 60 * 1000,
      );

      await WasteBagModel.update(
        {
          wasteStatus: 'IN_TEMPORARY_STORAGE',
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: updated_by,
          storageStartTimestamp: storageStartTimestamp,
          scheduledStorageEndDatetime: scheduledStorageEndDatetime,
          maxStorageHours: wasteClassification.tempStorageMaxHours,
          wasteTreatmentGroupId: wasteBagTreatmentGroupId,
          minStorageHours: wasteClassification.tempStorageMinHours,
          updatedBy: updated_by,
        },
        {
          where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      );

      return wasteBagTreatmentGroupId;
    } catch (error) {
      console.error('Error updating WasteBag status:', error);
      return null;
    }
  }

  async coldStoreWasteBag(
    wasteBagQrCodeIds: string[],
    createdBy: string,
  ): Promise<number | null | string> {
    try {
      const allRequestedWasteBags = await WasteBagModel.findAll({
        attributes: ['wasteClassificationId', 'healthcareFacilityId', 'weightInKgs'],
        where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
      });

      if (allRequestedWasteBags.length !== wasteBagQrCodeIds.length) {
        return 'NOT_FOUND';
      }

      const distinctWasteClassificationIds = new Set(
        allRequestedWasteBags.map((bag) => bag.get('wasteClassificationId') as number),
      );

      if (distinctWasteClassificationIds.size > 1) {
        return 'MIXED_CLASSIFICATION_NOT_ALLOWED';
      }

      const wasteBag = allRequestedWasteBags[0];

      const wasteClassification =
        await InfraRegistry.wasteClassificationRepositoryImpl!.getWasteClassificationById(
          wasteBag.get('wasteClassificationId') as number,
        );

      if (!wasteClassification) {
        return 'WASTE_CLASSIFICATION_NOT_FOUND';
      }

      if (!wasteClassification.useColdStorage) {
        return 'NOT_USE_COLD_STORAGE';
      }

      if (wasteClassification.coldStorageMaxHours === undefined) {
        return 'MAX_COLD_STORAGE_TIME_NOT_FOUND';
      }

      const startDate = new Date();
      const scheduledStorageEndDatetime = new Date(
        startDate.getTime() + wasteClassification.coldStorageMaxHours * 60 * 60 * 1000,
      );

      if (process.env.IS_ASSET_NEW === 'true') {
        const healthcareFacilityAsset = await HealthcareAssetModel.findOne({
          where: {
            healthcareFacilityId: wasteBag.getDataValue('healthcareFacilityId') as number,
            status: 1,
            assetWorkingStatusName: 1,
            assetTypeName: 'Waste Cold Storage',
          },
        });

        if (!healthcareFacilityAsset) {
          return 'FACILITY_COLD_STORAGE_NOT_FOUND';
        }
      } else {
        const healthcareFacilityAsset = await HealthcareFacilityAssetModel.findOne({
          where: {
            healthcareFacilityId: wasteBag.getDataValue('healthcareFacilityId') as number,
            assetStatus: 'OPERATIONAL',
          },
          include: {
            model: AssetModelSeq,
            as: 'assetModel',
            where: {
              asset_type: 'COLD_STORAGE',
            },
          },
        });

        if (!healthcareFacilityAsset) {
          return 'FACILITY_COLD_STORAGE_NOT_FOUND';
        }
      }

      const wasteBagTreatmentGroupId =
        await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.createWasteBagTreatmentGroupFromBags(
          allRequestedWasteBags,
          wasteBagQrCodeIds,
          createdBy,
          'IN_COLD_STORAGE',
        );

      if (!wasteBagTreatmentGroupId) {
        return 'UNSUCCESS_CREATE_COLD_STORAGE_WG';
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'IN_COLD_STORAGE',
          wasteTreatmentGroupId: wasteBagTreatmentGroupId,
          updatedBy: createdBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: createdBy,
          storageStartTimestamp: new Date(),
          maxStorageHours: wasteClassification.coldStorageMaxHours,
          minStorageHours: wasteClassification.coldStorageMinHours,
          scheduledStorageEndDatetime: scheduledStorageEndDatetime,
        },
        {
          where: {
            [Op.or]: {
              wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds },
            },
          },
        },
      );
      return wasteBagTreatmentGroupId;
    } catch (error) {
      console.error('Error updating WasteBag status:', error);
      return null;
    }
  }

  async internalLandfillTreatment(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<number | null | string> {
    try {
      const wasteBagTreatmentGroupId =
        await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.createWasteBagTreatmentGroup(
          wasteBagQrCodeIds,
          createdBy,
          'INTERNAL_LANDFILL_IN_PROCESS',
        );

      if (!wasteBagTreatmentGroupId) {
        return 'UNSUCCESS_CREATE_INTERNAL_LANDFILL_WG';
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'INTERNAL_LANDFILL_IN_PROCESS',
          wasteTreatmentGroupId: wasteBagTreatmentGroupId,
          updatedBy: createdBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: createdBy,
          treatmentStartTime: treatmentStartTime,
          treatmentEndTime: treatmentEndTime,
        },
        {
          where: {
            [Op.or]: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
          },
        },
      );

      const wasteBagInstance = await WasteBagModel.findOne({
        attributes: ['bastNo'],
        where: {
          [Op.or]: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      });

      const wasteBag = wasteBagInstance?.get({ plain: true });

      if (wasteBag?.bastNo) {
        await DisposalModel.update(
          {
            isRead: true,
          },
          {
            where: {
              bastNo: wasteBag.bastNo,
            },
          },
        );
      }

      return wasteBagTreatmentGroupId;
    } catch (error) {
      console.error('Error updating WasteBag status to internal treatment:', error);
      return null;
    }
  }

  async autoclaveWasteBag(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<number | null | string> {
    try {
      const wasteBagTreatmentGroupId =
        await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.createWasteBagTreatmentGroup(
          wasteBagQrCodeIds,
          createdBy,
          'STERILIZATION_IN_PROCESS',
        );

      if (!wasteBagTreatmentGroupId) {
        return 'UNSUCCESS_CREATE_STERILISE_WG';
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'STERILIZATION_IN_PROCESS',
          wasteTreatmentGroupId: wasteBagTreatmentGroupId,
          updatedBy: createdBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: createdBy,
          treatmentStartTime: treatmentStartTime,
          treatmentEndTime: treatmentEndTime,
        },
        {
          where: {
            [Op.or]: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
          },
        },
      );

      const wasteBagInstance = await WasteBagModel.findOne({
        attributes: ['bastNo'],
        where: {
          [Op.or]: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      });

      const wasteBag = wasteBagInstance?.get({ plain: true });

      if (wasteBag?.bastNo) {
        await DisposalModel.update(
          {
            isRead: true,
          },
          {
            where: {
              bastNo: wasteBag.bastNo,
            },
          },
        );
      }

      return wasteBagTreatmentGroupId;
    } catch (error) {
      console.error('Error updating WasteBag status to sterilise:', error);
      return null;
    }
  }

  async incinerateWasteBag(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<number | null | string> {
    try {
      const wasteBagTreatmentGroupId =
        await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.createWasteBagTreatmentGroup(
          wasteBagQrCodeIds,
          createdBy,
          'INCINERATION_IN_PROCESS',
        );

      if (!wasteBagTreatmentGroupId) {
        return 'UNSUCCESS_CREATE_INCINERATION_WG';
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'INCINERATION_IN_PROCESS',
          wasteTreatmentGroupId: wasteBagTreatmentGroupId,
          updatedBy: createdBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: createdBy,
          treatmentStartTime: treatmentStartTime,
          treatmentEndTime: treatmentEndTime,
        },
        {
          where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      );

      const wasteBagInstance = await WasteBagModel.findOne({
        attributes: ['bastNo'],
        where: {
          [Op.or]: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      });

      const wasteBag = wasteBagInstance?.get({ plain: true });

      if (wasteBag?.bastNo) {
        await DisposalModel.update(
          {
            isRead: true,
          },
          {
            where: {
              bastNo: wasteBag.bastNo,
            },
          },
        );
      }

      return wasteBagTreatmentGroupId;
    } catch (error) {
      console.error('Error updating WasteBag status to sterilise:', error);
      return null;
    }
  }

  async createTransportRequestedWasteBag(
    wasteBagQrCodeIds: string[],
    // transporterOperatorId: string,
    consumerId: number,
    providerType: string,
    updatedBy: string,
    transporterVehicleId?: number,
  ): Promise<number | null | string> {
    try {
      const allRequestedWasteBags = await WasteBagModel.findAll({
        attributes: [
          'id',
          'wasteBagQrCodeId',
          'wasteClassificationId',
          'wasteTransportationExternalGroupId',
          'wasteTreatmentGroupId',
          'wasteGroupIds',
          'transporterId',
          'wasteStatus',
          'weightInKgs',
        ],
        where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
      });

      if (allRequestedWasteBags.length !== wasteBagQrCodeIds.length) {
        return 'NOT_FOUND';
      }

      const wasteBagInstance = allRequestedWasteBags.find(
        (bag) => bag.get('wasteBagQrCodeId') === wasteBagQrCodeIds[0],
      );

      if (
        !wasteBagInstance ||
        ['INCINERATION_IN_PROCESS', 'STERILIZATION_IN_PROCESS'].includes(
          wasteBagInstance.get('wasteStatus') as string,
        )
      ) {
        return 'NOT_FOUND';
      }

      const wasteBag = wasteBagInstance.get({ plain: true });

      const distinctWasteClassificationIds = [
        ...new Set(allRequestedWasteBags.map((bag) => bag.get('wasteClassificationId') as number)),
      ];

      let transporterIdPartnership: Partnership | null = null;
      let treatmentIdPartnership: Partnership | null = null;

      const partnershipChecksByClassification = await Promise.all(
        distinctWasteClassificationIds.map(async (wasteClassificationId) => {
          const baseWhere = {
            consumerId,
            wasteClassificationId,
            partnershipStatus: 'ACTIVE',
          };

          const [transporterPartnershipCheck, treatmentPartnershipCheck] = await Promise.all([
            InfraRegistry.partnershipRepositoryImpl!.findPartnershipByCondition({
              ...baseWhere,
              transporterId: { [Op.is]: null },
            }),
            InfraRegistry.partnershipRepositoryImpl!.findPartnershipByCondition({
              ...baseWhere,
              transporterId: { [Op.not]: null },
            }),
          ]);

          return { wasteClassificationId, transporterPartnershipCheck, treatmentPartnershipCheck };
        }),
      );

      for (const {
        wasteClassificationId,
        transporterPartnershipCheck,
        treatmentPartnershipCheck,
      } of partnershipChecksByClassification) {
        if (!transporterPartnershipCheck) {
          return 'PARTNERSHIP_TRANSPORTER_NOT_FOUND';
        }

        if (!treatmentPartnershipCheck) {
          return 'PARTNERSHIP_THIRD_PARTY_NOT_FOUND';
        }

        if (wasteClassificationId === wasteBag?.wasteClassificationId) {
          transporterIdPartnership = transporterPartnershipCheck;
          treatmentIdPartnership = treatmentPartnershipCheck;
        }
      }

      if (!transporterIdPartnership) {
        return 'PARTNERSHIP_TRANSPORTER_NOT_FOUND';
      }

      if (!treatmentIdPartnership) {
        return 'PARTNERSHIP_THIRD_PARTY_NOT_FOUND';
      }

      const wasteBagTransportGroup =
        await InfraRegistry.wasteBagTransportGroupRepositoryImpl!.createWasteTransportationGroupFromBags(
          allRequestedWasteBags,
          wasteBagQrCodeIds,
          {
            id: undefined,
            // handoverLattitude: handoverLattitude,
            // handoverLongitude: handoverLongitude,
            // transporterOperatorId: transporterOperatorId,
            transporterVehicleId: transporterVehicleId,
            createdBy: updatedBy,
            updatedBy: updatedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalBagsCount: wasteBagQrCodeIds.length,
            totalWeightInKgs: 0,
            transportationStatus: 'READY_FOR_TRANSPORT',
          },
          consumerId,
          providerType,
        );

      if (!wasteBagTransportGroup) {
        return 'UNSUCCESS_CREATE_TP1_WG';
      }

      const wasteBagTransportExternalGroup =
        await InfraRegistry.wasteBagTransportationExternalGroupImpl!.createWasteTransportationExternalGroupFromBags(
          allRequestedWasteBags,
          wasteBagQrCodeIds,
          {
            id: undefined,
            // handoverLattitude: handoverLattitude,
            // handoverLongitude: handoverLongitude,
            // transporterOperatorId: transporterOperatorId,
            transporterVehicleId: transporterVehicleId,
            createdBy: updatedBy,
            updatedBy: updatedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalBagsCount: wasteBagQrCodeIds.length,
            totalWeightInKgs: 0,
            transportationStatus: 'IN_TRANSIT',
            transporterId: transporterIdPartnership.providerId,
            // handoverTimestamp: handoverTimestamp,
            // treatmentProviderId: treatmentProviderId,
            // treatmentOperatorId: treatmentOperatorId,
            isReadOnly: false,
          },
          transporterIdPartnership.providerId as number,
          providerType,
        );

      if (!wasteBagTransportExternalGroup) {
        return 'UNSUCCESS_CREATE_TP2_WG';
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'READY_FOR_TRANSPORT',
          transportationStatus: 'REQUESTED',
          transporterId: transporterIdPartnership.providerId,
          thirdPartyId: treatmentIdPartnership.providerId,
          wasteTransportationGroupId: wasteBagTransportGroup.id,
          wasteTransportationExternalGroupId: wasteBagTransportExternalGroup.id,
          updatedBy: updatedBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: updatedBy,
        },
        {
          where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      );

      if (wasteBag.wasteGroupIds) {
        const formatData = wasteBag.wasteGroupIds
          .split(',')
          .map((id) => Number(id.trim()))
          .filter(Boolean);

        await WasteBagTreatmentGroupModel.update(
          { isReadOnly: true },
          {
            where: {
              id: { [Op.in]: formatData },
            },
          },
        );
      }

      return wasteBagTransportGroup.id!;
    } catch (error) {
      console.error('Error updating WasteBag status to transport requested:', error);
      return null;
    }
  }

  async createHandoverTransportWasteBag(
    wasteTransportationGroupIds: number[],
    // wasteBagQrCodeIds: string[],
    handoverLattitude: number,
    handoverLongitude: number,
    vehicleNumber: string,
    handoverTimestamp: Date,
    manifestDocNumber: string,
    updatedBy: string,
    transporterOperatorId?: string,
  ): Promise<string[] | string> {
    try {
      const wasteBagInstance = await WasteBagModel.findOne({
        attributes: ['id', 'transporterId'],
        where: {
          wasteTransportationGroupId: {
            [Op.in]: wasteTransportationGroupIds,
          },
          wasteStatus: 'READY_FOR_TRANSPORT',
        },
      });

      if (!wasteBagInstance) {
        return 'NOT_FOUND';
      }

      const wasteBag = wasteBagInstance.get({ plain: true });

      const vehicleId =
        await InfraRegistry.partnershipVehicleRepositoryImpl!.getPartnerVehicleByVehicleNumber(
          vehicleNumber,
          wasteBag.transporterId as number,
        );

      if (!vehicleId) {
        return `VEHICLE_NOT_FOUND`;
      }

      await WasteTransportationGroupModel.update(
        {
          handoverLattitude: handoverLattitude,
          handoverLongitude: handoverLongitude,
          transporterVehicleId: vehicleId?.id,
          transporterOperatorId: transporterOperatorId,
          createdBy: updatedBy,
          updatedBy: updatedBy,
          created_at: new Date(),
          updated_at: new Date(),
          transportationStatus: 'TRANSPORTATION_REQUEST_CREATED',
          handoverTimestamp: handoverTimestamp,
        },
        {
          where: {
            id: { [Op.in]: wasteTransportationGroupIds },
          },
          returning: true,
        },
      );

      await WasteBagModel.update(
        {
          wasteStatus: 'TRANSPORTATION_REQUEST_CREATED',
          transportationStatus: 'IN_TRANSIT',
          updatedBy: updatedBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: updatedBy,
          manifestDocNumber: manifestDocNumber.toString(),
        },
        {
          where: {
            wasteTransportationGroupId: { [Op.in]: wasteTransportationGroupIds },
          },
        },
      );

      const affectedWasteBags = await WasteBagModel.findAll({
        where: {
          wasteTransportationGroupId: { [Op.in]: wasteTransportationGroupIds },
          wasteStatus: 'TRANSPORTATION_REQUEST_CREATED',
          transportationStatus: 'IN_TRANSIT',
          wasteStatusUpdatedBy: updatedBy,
        },
        attributes: ['wasteBagQrCodeId'],
      });

      return affectedWasteBags.map((bag) => bag.dataValues.wasteBagQrCodeId as string);
    } catch (error) {
      console.error('Error updating WasteBag:', error);
      throw new Error('Error updating WasteBag: ' + error);
    }
  }

  async createTransportExternalRequestedWasteBag(
    wasteBagQrCodeIds: string[],
    consumerId: number,
    providerType: string,
    updatedBy: string,
    token: string,
    treatmentProviderId?: number,
    treatmentOperatorId?: string,
    isReadOnly?: boolean,
    transporterId?: number,
    thirdPartyId?: number,
  ): Promise<number | null | string> {
    try {
      const allRequestedWasteBags = await WasteBagModel.findAll({
        attributes: [
          'id',
          'wasteBagQrCodeId',
          'wasteClassificationId',
          'wasteTransportationExternalGroupId',
          'wasteGroupIds',
          'transporterId',
          'bastNo',
          'wasteStatus',
          'weightInKgs',
        ],
        where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
      });

      if (allRequestedWasteBags.length !== wasteBagQrCodeIds.length) {
        return 'NOT_FOUND';
      }

      const wasteBagInstance = allRequestedWasteBags.find(
        (bag) => bag.get('wasteBagQrCodeId') === wasteBagQrCodeIds[0],
      );

      if (
        !wasteBagInstance ||
        ['INCINERATION_IN_PROCESS', 'STERILIZATION_IN_PROCESS'].includes(
          wasteBagInstance.get('wasteStatus') as string,
        )
      ) {
        return 'NOT_FOUND';
      }

      const wasteBag = wasteBagInstance.get({ plain: true });

      const repo = InfraRegistry.partnershipRepositoryImpl!;

      const distinctWasteClassificationIds = [
        ...new Set(allRequestedWasteBags.map((bag) => bag.get('wasteClassificationId') as number)),
      ];

      let transporterIdPartnership: Partnership | null = null;
      let treatmentIdPartnership: Partnership | null = null;

      const partnershipChecksByClassification = await Promise.all(
        distinctWasteClassificationIds.map(async (wasteClassificationId) => {
          const baseWhere = {
            consumerId,
            wasteClassificationId,
            partnershipStatus: 'ACTIVE',
          };

          const [transporterPartnershipCheck, treatmentPartnershipCheck] = await Promise.all([
            repo.findPartnershipByCondition({
              ...baseWhere,
              transporterId: { [Op.is]: null },
              ...(transporterId != null && { providerId: transporterId }),
            }),
            repo.findPartnershipByCondition({
              ...baseWhere,
              transporterId: { [Op.not]: null },
              ...(thirdPartyId != null && { providerId: thirdPartyId }),
            }),
          ]);

          return { wasteClassificationId, transporterPartnershipCheck, treatmentPartnershipCheck };
        }),
      );

      for (const {
        wasteClassificationId,
        transporterPartnershipCheck,
        treatmentPartnershipCheck,
      } of partnershipChecksByClassification) {
        if (!transporterPartnershipCheck) {
          return 'PARTNERSHIP_TRANSPORTER_NOT_FOUND';
        }

        if (!treatmentPartnershipCheck) {
          return 'PARTNERSHIP_THIRD_PARTY_NOT_FOUND';
        }

        if (wasteClassificationId === wasteBag?.wasteClassificationId) {
          transporterIdPartnership = transporterPartnershipCheck;
          treatmentIdPartnership = treatmentPartnershipCheck;
        }
      }

      if (!transporterIdPartnership) {
        return 'PARTNERSHIP_TRANSPORTER_NOT_FOUND';
      }

      if (!treatmentIdPartnership) {
        return 'PARTNERSHIP_THIRD_PARTY_NOT_FOUND';
      }

      if (wasteBag.bastNo) {
        await DisposalModel.update(
          {
            isRead: true,
          },
          {
            where: {
              bastNo: wasteBag.bastNo,
            },
          },
        );
      }

      const wasteBagTransportExternalGroup =
        await InfraRegistry.wasteBagTransportationExternalGroupImpl!.createWasteTransportationExternalGroupFromBags(
          allRequestedWasteBags,
          wasteBagQrCodeIds,
          {
            id: undefined,
            createdBy: updatedBy,
            updatedBy: updatedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalBagsCount: wasteBagQrCodeIds.length,
            totalWeightInKgs: 0,
            transportationStatus: 'IN_TRANSIT',
            transporterId: transporterIdPartnership.providerId,
            isReadOnly: isReadOnly,
          },
          treatmentProviderId as number,
          providerType,
        );

      if (!wasteBagTransportExternalGroup) {
        return 'UNSUCCESS_CREATE_TP2_WG';
      }

      //get entity
      const dataEntityTransporter = await getEntityDetail(
        transporterIdPartnership.providerId,
        token,
      );
      const dataEntityTreatment = await getEntityDetail(treatmentIdPartnership.providerId, token);

      await WasteBagModel.update(
        {
          wasteStatus: 'READY_FOR_TRANSPORT',
          transportationStatus: 'REQUESTED',
          transporterId: transporterIdPartnership.providerId,
          transporterName: dataEntityTransporter?.name,
          thirdPartyId: treatmentIdPartnership.providerId,
          thirdPartyName: dataEntityTreatment?.name,
          wasteTransportationExternalGroupId: wasteBagTransportExternalGroup.id,
          updatedBy: updatedBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: updatedBy,
        },
        {
          where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      );

      if (wasteBag.wasteGroupIds) {
        const formatData = wasteBag.wasteGroupIds
          .split(',')
          .map((id) => Number(id.trim()))
          .filter(Boolean);

        await WasteBagTreatmentGroupModel.update(
          { isReadOnly: true },
          {
            where: {
              id: { [Op.in]: formatData },
            },
          },
        );
      }

      return wasteBagTransportExternalGroup.id!;
    } catch (error) {
      console.error('Error updating WasteBag status to transport requested:', error);
      return null;
    }
  }

  async createHandoverTransportExternalWasteBag(
    wasteTransportationExternalGroupIds: number[],
    healthcareFacilityId: number,
    handoverLatitude: number,
    handoverLongitude: number,
    vehicleNumber: string,
    handoverTimestamp: Date,
    manifestDocNumber: string,
    updatedBy: string,
    transporterOperatorId?: string,
    treatmentProviderId?: number,
    treatmentOperatorId?: string,
    isReadOnly?: boolean,
  ): Promise<string[] | string> {
    try {
      // Pastikan parameter valid
      if (
        !Array.isArray(wasteTransportationExternalGroupIds) ||
        wasteTransportationExternalGroupIds.length === 0
      ) {
        return 'INVALID_GROUP_IDS';
      }

      // Ambil salah satu WasteBag untuk referensi transporter
      const wasteBagInstance = await WasteBagModel.findOne({
        attributes: ['id', 'transporterId'],
        where: {
          wasteTransportationExternalGroupId: {
            [Op.in]: wasteTransportationExternalGroupIds,
          },
          healthcareFacilityId,
          wasteStatus: 'READY_FOR_TRANSPORT',
        },
      });

      if (!wasteBagInstance) return 'NOT_FOUND';

      const wasteBag = wasteBagInstance.get({ plain: true });

      // Pastikan kendaraan valid untuk transporter terkait
      const vehicle =
        await InfraRegistry.partnershipVehicleRepositoryImpl!.getPartnerVehicleByVehicleNumber(
          vehicleNumber,
          wasteBag.transporterId as number,
          healthcareFacilityId,
        );

      if (!vehicle) return 'VEHICLE_NOT_FOUND';

      // Update semua group transport eksternal sekaligus
      await WasteTransportationExternalGroupModel.update(
        {
          handoverLattitude: handoverLatitude,
          handoverLongitude: handoverLongitude,
          transporterId: wasteBag.transporterId,
          transporterVehicleId: vehicle.id,
          transporterOperatorId,
          updatedBy,
          transportationStatus: 'TRANSPORTATION_REQUEST_CREATED',
          handoverTimestamp,
          treatmentProviderId,
          treatmentOperatorId,
          isReadOnly,
        },
        {
          where: { id: { [Op.in]: wasteTransportationExternalGroupIds } },
        },
      );

      // Update semua WasteBag terkait menjadi handed over
      await WasteBagModel.update(
        {
          wasteStatus: 'TRANSPORTATION_REQUEST_CREATED',
          transportationStatus: 'HANDED_OVER',
          updatedBy,
          wasteStatusUpdatedAt: new Date(),
          actualStorageEndTimestamp: new Date(),
          wasteStatusUpdatedBy: updatedBy,
          manifestDocNumber: manifestDocNumber.toString(),
        },
        {
          where: {
            wasteTransportationExternalGroupId: {
              [Op.in]: wasteTransportationExternalGroupIds,
            },
            transporterId: wasteBag.transporterId,
            healthcareFacilityId,
            wasteStatus: 'READY_FOR_TRANSPORT',
          },
        },
      );

      // Ambil semua QR code yang berhasil diupdate
      const affectedWasteBags = await WasteBagModel.findAll({
        where: {
          transporterId: wasteBag.transporterId,
          wasteStatus: 'TRANSPORTATION_REQUEST_CREATED',
          transportationStatus: 'HANDED_OVER',
          wasteStatusUpdatedBy: updatedBy,
          manifestDocNumber: manifestDocNumber.toString(),
        },
        attributes: ['wasteBagQrCodeId'],
      });

      const qrCodeIds = affectedWasteBags.map((b) => b.dataValues.wasteBagQrCodeId as string);
      return qrCodeIds.length ? qrCodeIds : 'NO_WASTE_BAGS_UPDATED';
    } catch (error) {
      console.error('Error updating WasteBag:', error);
      throw new Error(
        'Error updating WasteBag: ' + (error instanceof Error ? error.message : error),
      );
    }
  }

  async createPickUpTransportExternalWasteBag(
    wasteTransportationExternalGroupIds: number[],
    healthcareFacilityId: number,
    handoverLattitude: number,
    handoverLongitude: number,
    updatedBy: string,
    transporterOperatorId: string,
    transporterId: number,
    treatmentProviderId?: number,
    treatmentOperatorId?: string,
    isReadOnly?: boolean,
  ): Promise<
    | {
        wasteBagQrCodeId: string[];
        healthcareFacilityId: number;
      }
    | string
  > {
    try {
      const wasteBagInstance = await WasteBagModel.findOne({
        attributes: ['id', 'transporterId'],
        where: {
          wasteTransportationExternalGroupId: {
            [Op.in]: wasteTransportationExternalGroupIds,
          },
          healthcareFacilityId: healthcareFacilityId,
          transporterId: transporterId,
          wasteStatus: 'TRANSPORTATION_REQUEST_CREATED',
          transportationStatus: 'HANDED_OVER',
        },
      });

      if (!wasteBagInstance) {
        return 'NOT_FOUND';
      }

      const wasteBag = wasteBagInstance.get({ plain: true });

      await WasteTransportationExternalGroupModel.update(
        {
          handoverLattitude: handoverLattitude,
          handoverLongitude: handoverLongitude,
          transporterId: wasteBag.transporterId,
          transporterOperatorId: transporterOperatorId,
          updatedBy: updatedBy,
          pickupAt: new Date(),
          transportationStatus: 'IN_TRANSIT',
          treatmentProviderId: treatmentProviderId,
          treatmentOperatorId: treatmentOperatorId,
          isReadOnly: isReadOnly,
        },
        {
          where: {
            id: {
              [Op.in]: wasteTransportationExternalGroupIds,
            },
          },
          silent: true,
        },
      );

      const baseUpdate = {
        updatedBy: updatedBy,
        wasteStatus: 'IN_TRANSIT' as const,
        wasteStatusUpdatedAt: new Date(),
        actualStorageEndTimestamp: new Date(),
        wasteStatusUpdatedBy: updatedBy,
      };

      const dataUpdate = wasteBag.wasteGroupIds
        ? { ...baseUpdate, treatmentStartTime: new Date() }
        : baseUpdate;

      await WasteBagModel.update(dataUpdate, {
        where: {
          wasteTransportationExternalGroupId: {
            [Op.in]: wasteTransportationExternalGroupIds,
          },
          transporterId: wasteBag.transporterId,
          healthcareFacilityId,
          wasteStatus: 'TRANSPORTATION_REQUEST_CREATED',
        },
      });

      const affectedWasteBags = await WasteBagModel.findAll({
        where: {
          wasteTransportationExternalGroupId: {
            [Op.in]: wasteTransportationExternalGroupIds,
          },
          transporterId: wasteBag.transporterId,
          wasteStatus: 'IN_TRANSIT',
        },
        attributes: ['wasteBagQrCodeId'],
      });

      return {
        wasteBagQrCodeId: affectedWasteBags.map((bag) => bag.dataValues.wasteBagQrCodeId as string),
        healthcareFacilityId: healthcareFacilityId ?? wasteBag.healthcareFacilityId,
      };
    } catch (error) {
      console.error('Error updating WasteBag:', error);
      throw new Error('Error updating WasteBag: ' + error);
    }
  }

  async createHandoverTreatmentExternalWasteBag(
    wasteTransportationExternalGroupIds: number[],
    entityId: number,
    updatedBy: string,
    startTime: string | Date,
    endTime: string | Date,
    treatmentLocationId: number,
    treatmentId?: number,
  ): Promise<{ wasteBagQrCodeIds: string[]; healthcareFacilityId: number } | string> {
    try {
      const wasteTreatmentExternalGroups =
        await InfraRegistry.wasteTreatmentExternalGroupImpl!.createWasteTreatmentExternalGroup(
          wasteTransportationExternalGroupIds,
          updatedBy,
          entityId,
        );

      const wasteTreatmentIds: number[] = [];

      if (
        !wasteTreatmentExternalGroups.length ||
        wasteTreatmentExternalGroups.length === 0 ||
        typeof wasteTreatmentExternalGroups === 'string'
      ) {
        return wasteTreatmentExternalGroups as string;
      }

      await Promise.all(
        wasteTreatmentExternalGroups.map(async (group) => {
          await WasteBagModel.update(
            {
              wasteStatus: 'HANDOVER_TO_TREATMENT',
              transportationStatus: 'HANDED_OVER',
              wasteTreatmentExternalGroupId: group.id,
              thirdPartyId: treatmentId,
              updatedBy: updatedBy,
              transportationStatusUpdatedBy: updatedBy,
              wasteStatusUpdatedAt: new Date(),
              wasteStatusUpdatedBy: updatedBy,
              treatmentLocationId: treatmentLocationId,
            },
            {
              where: {
                wasteTransportationExternalGroupId: group.transportationGroupId,
              },
            },
          );

          wasteTreatmentIds.push(group.id);
        }),
      );

      const affectedWasteBags = await WasteBagModel.findAll({
        where: {
          wasteTreatmentExternalGroupId: {
            [Op.in]: wasteTreatmentIds,
          },
          wasteStatus: 'HANDOVER_TO_TREATMENT',
        },
        attributes: ['wasteBagQrCodeId', 'healthcareFacilityId'],
      });

      return {
        wasteBagQrCodeIds: affectedWasteBags.map(
          (bag) => bag.dataValues.wasteBagQrCodeId as string,
        ),
        healthcareFacilityId: affectedWasteBags[0].dataValues.healthcareFacilityId,
      };
    } catch (error) {
      console.error('Error updating WasteBag:', error);
      throw new Error('Error updating WasteBag: ' + error);
    }
  }

  async createReceivingTreatmentExternalWasteBag(
    wasteBagQrCodeIds: string[],
    entityId: number,
    updatedBy: string,
    startTime: string | Date,
    endTime: string | Date,
  ): Promise<
    { wasteBagQrCodeIds: string[]; groupId: number; healthcareFacilityId: number } | string
  > {
    try {
      const whereClauseWasteBag =
        await InfraRegistry.wasteTreatmentExternalGroupImpl!.receieveWasteTreatmentExternalGroup(
          wasteBagQrCodeIds,
          updatedBy,
          entityId,
        );

      if (typeof whereClauseWasteBag === 'string') return whereClauseWasteBag;

      const { id, wasteBag } = whereClauseWasteBag;

      await WasteBagModel.update(
        {
          wasteStatus: 'READY_FOR_TREATMENT',
          transportationStatus: 'HANDED_OVER',
          wasteTreatmentExternalGroupId: id,
          treatmentStartTime: new Date(startTime),
          thirdPartyId: entityId,
          updatedBy: updatedBy,
          transportationStatusUpdatedBy: updatedBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: updatedBy,
          ownedBy: 'THIRD_PARTY',
        },
        {
          where: { wasteBagQrCodeId: { [Op.in]: wasteBagQrCodeIds } },
        },
      );

      if (whereClauseWasteBag.wasteBag.wasteTransportationExternalGroupId) {
        await sequelize.query(
          `
            UPDATE waste_transportation_external_group wteg
            SET wteg.is_read_only = :isReadOnly
            WHERE id = :id
            `,
          {
            replacements: {
              isReadOnly: true,
              id: whereClauseWasteBag.wasteBag.wasteTransportationExternalGroupId,
            },
            type: QueryTypes.UPDATE,
          },
        );
      }

      return {
        wasteBagQrCodeIds: wasteBagQrCodeIds,
        groupId: id,
        healthcareFacilityId: wasteBag.healthcareFacilityId,
      };
    } catch (error) {
      console.error('Error updating WasteBag:', error);
      throw new Error('Error updating WasteBag: ' + error);
    }
  }

  async postTreatment(
    schema: 'DISINFECTION' | 'PYROLYSIS' | 'LANDFILLED' | 'RECYCLED' | 'DISPOSED',
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean | string> {
    try {
      switch (schema) {
        case 'DISINFECTION': {
          return await InfraRegistry.wasteTreatmentExternalGroupImpl!.steriliseWasteBagExternal(
            wasteBagQrCodeIds,
            createdBy,
            treatmentStartTime,
            treatmentEndTime,
          );
        }
        case 'PYROLYSIS': {
          return await InfraRegistry.wasteTreatmentExternalGroupImpl!.incinerateWasteBagExternal(
            wasteBagQrCodeIds,
            createdBy,
            treatmentStartTime,
            treatmentEndTime,
          );
        }
        case 'LANDFILLED': {
          return await InfraRegistry.wasteTreatmentExternalGroupImpl!.landfilledWasteBagExternal(
            wasteBagQrCodeIds,
            createdBy,
            treatmentStartTime,
            treatmentEndTime,
          );
        }
        case 'RECYCLED': {
          return await InfraRegistry.wasteTreatmentExternalGroupImpl!.recycledWasteBagExternal(
            wasteBagQrCodeIds,
            createdBy,
            treatmentStartTime,
            treatmentEndTime,
          );
        }
        case 'DISPOSED': {
          return await InfraRegistry.wasteTreatmentExternalGroupImpl!.disposedWasteBagExternal(
            wasteBagQrCodeIds,
            createdBy,
            treatmentStartTime,
            treatmentEndTime,
          );
        }
      }
    } catch (error) {
      console.error('Error post treatment method WasteBag:', error);
      return false;
    }
  }

  async updateFilePath(
    wasteTransportationExternalGroupId: number[],
    docNumber: string,
    docPath: string,
  ): Promise<boolean> {
    try {
      const result = await WasteBagModel.update(
        {
          manifestDocPath: docPath,
          manifestDocNumber: docNumber,
        },
        {
          where: {
            wasteTransportationExternalGroupId: {
              [Op.in]: wasteTransportationExternalGroupId,
            },
          },
          returning: true,
        },
      );

      return result[0] > 0;
    } catch (error) {
      console.error('Error updating WasteBag:', error);
      throw new Error('Error updating WasteBag: ' + error);
    }
  }

  async inTransitWasteBag(wasteBagTransportGroupId: number, updatedBy: string): Promise<boolean> {
    try {
      const wasteBagTransportGroup =
        await InfraRegistry.wasteBagTransportGroupRepositoryImpl!.getWasteBagTransportGroupById(
          wasteBagTransportGroupId,
        );

      if (!wasteBagTransportGroup) {
        throw new Error('NOT_FOUND_WG');
      }

      await WasteBagModel.update(
        {
          transportationStatus: 'IN_TRANSIT',
          wasteTransportationGroupId: wasteBagTransportGroupId,
          updatedBy: updatedBy,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: updatedBy,
          ownedBy: 'TRANSPORTER',
        },
        {
          where: {
            wasteTransportationGroupId: wasteBagTransportGroupId,
          },
        },
      );

      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to in transit:', error);
      return false;
    }
  }

  async thirdPartyHandedOverWasteBag(
    wasteBagTransportGroupIds: number[],
    user: UserInfo,
  ): Promise<boolean> {
    try {
      const wasteBagTransportGroups =
        await InfraRegistry.wasteBagTransportGroupRepositoryImpl!.getWasteBagTransportGroupByIds(
          wasteBagTransportGroupIds,
        );

      if (wasteBagTransportGroupIds.length !== wasteBagTransportGroups.length) {
        throw new Error('NOT_FOUND_WG');
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'DISPOSED',
          transportationStatus: 'HANDED_OVER',
          updatedBy: user.username,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: user.username,
          ownedBy: 'THIRD_PARTY',
        },
        {
          where: {
            wasteTransportationGroupId: {
              [Op.in]: wasteBagTransportGroupIds,
            },
          },
        },
      );

      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to handovered:', error);
      return false;
    }
  }

  async landfillWasteBag(wasteBagTransportGroupIds: number[], user: UserInfo): Promise<boolean> {
    try {
      const wasteBagTransportGroups =
        await InfraRegistry.wasteBagTransportGroupRepositoryImpl!.getWasteBagTransportGroupByIds(
          wasteBagTransportGroupIds,
        );

      if (wasteBagTransportGroupIds.length !== wasteBagTransportGroups.length) {
        throw new Error('NOT_FOUND_WG');
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'DISPOSED',
          transportationStatus: 'HANDED_OVER',
          updatedBy: user.username,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: user.username,
          ownedBy: 'THIRD_PARTY',
        },
        {
          where: {
            wasteTransportationGroupId: {
              [Op.in]: wasteBagTransportGroupIds,
            },
          },
        },
      );

      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to handovered:', error);
      return false;
    }
  }

  async recycleWasteBag(wasteBagTransportGroupIds: number[], user: UserInfo): Promise<boolean> {
    try {
      const wasteBagTransportGroups =
        await InfraRegistry.wasteBagTransportGroupRepositoryImpl!.getWasteBagTransportGroupByIds(
          wasteBagTransportGroupIds,
        );

      if (wasteBagTransportGroupIds.length !== wasteBagTransportGroups.length) {
        throw new Error('NOT_FOUND_WG');
      }

      await WasteBagModel.update(
        {
          wasteStatus: 'DISPOSED',
          transportationStatus: 'HANDED_OVER',
          updatedBy: user.username,
          wasteStatusUpdatedAt: new Date(),
          wasteStatusUpdatedBy: user.username,
          ownedBy: 'THIRD_PARTY',
        },
        {
          where: {
            wasteTransportationGroupId: {
              [Op.in]: wasteBagTransportGroupIds,
            },
          },
        },
      );

      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to handovered:', error);
      return false;
    }
  }

  async saveWasteBag(wasteBag: WasteBag): Promise<WasteBag> {
    try {
      console.log('wasteBag:', wasteBag);
      const wasteBagModel = await WasteBagModel.findByPk(wasteBag.id);
      if (!wasteBagModel) {
        throw new Error('WasteBag not found');
      }

      // Update the fields that are allowed to be updated
      wasteBagModel.set('healthcareFacilityId', wasteBag.healthcareFacilityId);
      wasteBagModel.set('createdBy', wasteBag.createdBy);
      wasteBagModel.set('isDisposed', wasteBag.isDisposed);
      wasteBagModel.set('isTreated', wasteBag.isTreated);
      wasteBagModel.set('wasteSourceId', wasteBag.wasteSourceId);
      wasteBagModel.set('wasteClassificationId', wasteBag.wasteClassificationId);
      wasteBagModel.set('scaleMethod', wasteBag.scaleMethod);
      wasteBagModel.set('weightInKgs', wasteBag.weightInKgs);
      wasteBagModel.set('wasteBagQrCodeId', wasteBag.wasteBagQrCodeId)!;
      wasteBagModel.set('wasteStatus', wasteBag.wasteStatus);
      wasteBagModel.set('ownedBy', wasteBag.ownedBy);
      wasteBagModel.set('updatedBy', 'SYSTEM');
      if (wasteBag.wasteStatusUpdatedAt) {
        wasteBagModel.set(
          'wasteStatusUpdatedAt',
          new Date(wasteBag.wasteStatusUpdatedAt.getTime()),
        );
      }
      if (wasteBag.wasteStatusUpdatedBy) {
        wasteBagModel.set('wasteStatusUpdatedBy', wasteBag.wasteStatusUpdatedBy);
      }
      if (wasteBag.transportationStatus) {
        wasteBagModel.set('transportationStatus', wasteBag.transportationStatus);
      }
      if (wasteBag.transportationStatusUpdatedAt) {
        wasteBagModel.set(
          'transportationStatusUpdatedAt',
          new Date(wasteBag.transportationStatusUpdatedAt.getTime()),
        );
      }
      if (wasteBag.transportationStatusUpdatedBy) {
        wasteBagModel.set('transportationStatusUpdatedBy', wasteBag.transportationStatusUpdatedBy);
      }
      if (wasteBag.storageStartTimestamp) {
        wasteBagModel.set(
          'storageStartTimestamp',
          new Date(wasteBag.storageStartTimestamp.getTime()),
        );
      }
      if (wasteBag.scheduledStorageEndDatetime) {
        wasteBagModel.set(
          'scheduledStorageEndDatetime',
          new Date(wasteBag.scheduledStorageEndDatetime.getTime()),
        );
      }
      if (wasteBag.actualStorageEndDatetime) {
        wasteBagModel.set(
          'actualStorageEndTimestamp',
          new Date(wasteBag.actualStorageEndDatetime.getTime()),
        );
      }
      if (wasteBag.maxStorageHours) {
        wasteBagModel.set('maxStorageHours', wasteBag.maxStorageHours);
      }
      if (wasteBag.minimumStorageHours) {
        wasteBagModel.set('minStorageHours', wasteBag.minimumStorageHours);
      }
      if (wasteBag.wasteTreatmentGroupId) {
        wasteBagModel.set('wasteTreatmentGroupId', wasteBag.wasteTreatmentGroupId);
      }
      if (wasteBag.wasteTransportationGroupId) {
        wasteBagModel.set('wasteTransportationGroupId', wasteBag.wasteTransportationGroupId);
      }
      if (wasteBag.manifestDocPath) {
        wasteBagModel.set('manifestDocPath', wasteBag.manifestDocPath);
      }
      if (wasteBag.manifestDocNumber) {
        wasteBagModel.set('manifestDocNumber', wasteBag.manifestDocNumber);
      }
      if (wasteBag.id) {
        wasteBagModel.set('id', wasteBag.id);
      }
      // Save the updated model
      await wasteBagModel.save();

      const manifestDocPath = wasteBagModel.manifestDocPath
        ? await InfraRegistry.s3FileServiceRepositoryImpl!.getPresignedUrl(
            wasteBagModel.manifestDocPath,
          )
        : wasteBagModel.manifestDocPath;

      wasteBagModel.manifestDocPath = manifestDocPath;

      return getWasteBagFromModel(wasteBagModel, false);
    } catch (error) {
      console.error('Error saving WasteBag:', error);
      throw new Error('Database error');
    }
  }
}

function getWasteBagFromModel(
  wasteBagModel: WasteBagModel,
  isDetail: boolean,
  event?: any,
): WasteBag {
  const result = wasteBagModel.get({ plain: true }) as WasteBagModelAttributes;

  const wasteSource = result.wasteSource as WasteSourceAttributes | undefined;

  const transportationGroup = result.transportationGroup as
    | WasteTransportationGroupAttributes
    | undefined;

  const treatmentGroup = result.treatmentGroup as WasteBagTreatmentGroupModelAttributes | undefined;

  const transportationExternalGroup = result.transportationExternalGroup as
    | WasteTransportationExternalGroupAttributes
    | undefined;

  const treatmentExternalGroup = result.treatmentExternalGroup as
    | WasteTreatmentExternalGroupModelAttributes
    | undefined;

  const wasteClassification = result.wasteClassification as
    | WasteClassificationAttributes
    | undefined;

  const processWastebagEnd = handleAnalisisProcessCount(
    wasteClassification?.disposalMethod,
    wasteClassification?.treatmentMethod,
    result.isTreated as boolean,
    result.wasteGroupIds,
    result.wasteStatus,
  );

  return new WasteBag({
    id: result.id ?? wasteBagModel.id,
    healthcareFacilityId: result.healthcareFacilityId,
    createdAt: new Date(result.createdAt!.getTime()),
    createdBy: result.createdBy,
    isDisposed: result.isDisposed,
    isTreated: result.isTreated,
    wasteSourceId: result.wasteSourceId,
    wasteClassificationId: result.wasteClassificationId,
    scaleMethod: result.scaleMethod,
    weightInKgs: result.weightInKgs,
    wasteBagQrCodeId: result.wasteBagQrCodeId,
    wasteStatus: result.wasteStatus,
    ownedBy: result.ownedBy,
    updatedBy: result.updatedBy,
    wasteStatusUpdatedAt: result.wasteStatusUpdatedAt?.getTime
      ? new Date(result.wasteStatusUpdatedAt!.getTime())
      : undefined,
    wasteStatusUpdatedBy: result.wasteStatusUpdatedBy,
    transportationStatus: result.transportationStatus,
    transportationStatusUpdatedAt: result.transportationStatusUpdatedAt?.getTime
      ? new Date(result.transportationStatusUpdatedAt!.getTime())
      : undefined,
    transportationStatusUpdatedBy: result.transportationStatusUpdatedBy,
    storageStartTimestamp: result.storageStartTimestamp,
    scheduledStorageEndDatetime: result.scheduledStorageEndDatetime,
    actualStorageEndDatetime: result.actualStorageEndTimestamp,
    maxStorageHours: result.maxStorageHours,
    minimumStorageHours: result.minStorageHours,
    wasteTreatmentGroupId: result.wasteTreatmentGroupId,
    wasteTransportationGroupId: result.wasteTransportationGroupId,
    wasteTreatmentExternalGroupId: result.wasteTreatmentExternalGroupId,
    wasteTransportationExternalGroupId: result.wasteTransportationExternalGroupId,
    binNumber: result.binNumber,
    iotMethod: result.iotMethod,
    manifestDocNumber: result.manifestDocNumber,
    manifestDocPath: result.manifestDocPath,
    treatmentStartTime: result.treatmentStartTime,
    treatmentEndTime: result.treatmentEndTime,
    wasteGroupIds: result.wasteGroupIds,
    treatmentLocationId: result.treatmentLocationId,
    wasteSource: wasteSource
      ? {
          id: wasteSource.id,
          healthcareFacilityId: wasteSource.healthcareFacilityId,
          sourceType: wasteSource.sourceType,
          internalSourceName: wasteSource.internalSourceName,
          internalTreatmentName: wasteSource.internalTreatmentName,
          externalHealthcareFacilityId: wasteSource.externalHealthcareFacilityId,
          externalHealthcareFacilityName: wasteSource.externalHealthcareFacilityName,
          isActive: wasteSource.isActive,
          isResidue: wasteSource.isResidue,
        }
      : undefined,
    transportationGroup: transportationGroup
      ? {
          id: transportationGroup.id,
          totalBagsCount: transportationGroup.totalBagsCount,
          totalWeightInKgs: transportationGroup.totalWeightInKgs,
          transporterVehicleId: transportationGroup.transporterVehicleId,
          transporterOperatorId: transportationGroup.transporterOperatorId,
          handoverLattitude: transportationGroup.handoverLattitude,
          handoverLongitude: transportationGroup.handoverLongitude,
          transportationStatus: transportationGroup.transportationStatus,
          isReadOnly: transportationGroup.isReadOnly,
          groupId: transportationGroup.groupId,
        }
      : undefined,
    treatmentGroup: treatmentGroup
      ? {
          id: treatmentGroup.id,
          totalBagsCount: treatmentGroup.totalBagsCount,
          totalWeightInKgs: treatmentGroup.totalWeightInKgs,
          treatmentAssetId: treatmentGroup.treatmentAssetId,
          treatmentOperatorId: treatmentGroup.treatmentOperatorId,
          handoverLattitude: treatmentGroup.handoverLattitude,
          handoverLongitude: treatmentGroup.handoverLongitude,
          treatmentStatus: treatmentGroup.treatmentStatus,
          isReadOnly: treatmentGroup.isReadOnly,
          groupId: treatmentGroup.groupId,
        }
      : undefined,
    transportationExternalGroup: transportationExternalGroup
      ? {
          id: transportationExternalGroup.id,
          totalBagsCount: transportationExternalGroup.totalBagsCount,
          transporterId: transportationExternalGroup.transporterId,
          totalWeightInKgs: transportationExternalGroup.totalWeightInKgs,
          transporterVehicleId: transportationExternalGroup.transporterVehicleId,
          transporterOperatorId: transportationExternalGroup.transporterOperatorId,
          handoverLattitude: transportationExternalGroup.handoverLattitude,
          handoverLongitude: transportationExternalGroup.handoverLongitude,
          transportationStatus: transportationExternalGroup.transportationStatus,
          handoverTimestamp: transportationExternalGroup.handoverTimestamp,
          isReadOnly: transportationExternalGroup.isReadOnly,
          groupId: transportationExternalGroup.groupId,
        }
      : undefined,
    treatmentExternalGroup: treatmentExternalGroup
      ? {
          id: treatmentExternalGroup.id,
          totalBagsCount: treatmentExternalGroup.totalBagsCount,
          totalWeightInKgs: treatmentExternalGroup.totalWeightInKgs,
          treatmentOperatorId: treatmentExternalGroup.treatmentOperatorId,
          transportationStatus: treatmentExternalGroup.transportationStatus,
          isReadOnly: treatmentExternalGroup.isReadOnly,
          groupId: treatmentExternalGroup.groupId,
        }
      : undefined,
    wasteClassification: wasteClassification
      ? {
          id: wasteClassification.id,
          regionId: wasteClassification.regionId,
          effectiveFrom: wasteClassification.effectiveFrom,
          effectiveTo: wasteClassification.effectiveTo,
          wasteTypeId: wasteClassification.wasteTypeId,
          wasteGroupId: wasteClassification.wasteGroupId,
          wasteCharacteristicsId: wasteClassification.wasteCharacteristicsId,
          wasteCode: wasteClassification.wasteCode,
          wasteBagColorCode: wasteClassification.wasteBagColorCode,
          storageRuleType: wasteClassification.storageRuleType,
          useColdStorage: wasteClassification.useColdStorage,
          coldStorageMinHours: wasteClassification.coldStorageMinHours,
          coldStorageMaxHours: wasteClassification.coldStorageMaxHours,
          tempStorageMinHours: wasteClassification.tempStorageMinHours,
          tempStorageMaxHours: wasteClassification.tempStorageMaxHours,
          minimunDecayDay: wasteClassification.minimunDecayDay,
          storageRule: wasteClassification.storageRule,
          allowHealthcareFacilityTreatment: wasteClassification.allowHealthcareFacilityTreatment,
          isActive: wasteClassification.isActive,
          hasMultipleTransporters: wasteClassification.hasMultipleTransporters,
          treatmentMethod: wasteClassification.treatmentMethod,
          disposalMethod: wasteClassification.disposalMethod,
          allowedVehicleTypes: wasteClassification.allowedVehicleTypes,
          wasteType: {
            id: wasteClassification.wasteType.id,
            name: wasteClassification.wasteType.name,
            description: wasteClassification.wasteType.description,
            nameEn: wasteClassification.wasteType.nameEn,
            descriptionEn: wasteClassification.wasteType.descriptionEn,
            parentHierarchyId: wasteClassification.wasteType.parentHierarchyId,
          },
          wasteGroup: {
            id: wasteClassification.wasteGroup.id,
            name: wasteClassification.wasteGroup.name,
            description: wasteClassification.wasteGroup.description,
            nameEn: wasteClassification.wasteGroup.nameEn,
            descriptionEn: wasteClassification.wasteGroup.descriptionEn,
            parentHierarchyId: wasteClassification.wasteGroup.parentHierarchyId,
          },
          wasteCharacteristics: {
            id: wasteClassification.wasteCharacteristics.id,
            name: wasteClassification.wasteCharacteristics.name,
            description: wasteClassification.wasteCharacteristics.description,
            nameEn: wasteClassification.wasteCharacteristics.nameEn,
            descriptionEn: wasteClassification.wasteCharacteristics.descriptionEn,
            isResidue: wasteClassification.wasteCharacteristics.isResidue,
            parentHierarchyId: wasteClassification.wasteCharacteristics.parentHierarchyId,
          },
        }
      : undefined,
    logHistory: event ?? result.logHistory,
    processWastebagEnd: processWastebagEnd,
  });
}

function mapRawRowToWasteBag(row: any, logHistory: any[]): WasteBag {
  const wasteClassification = row.wc__id
    ? {
        id: row.wc__id,
        regionId: row.wc__region_id,
        effectiveFrom: row.wc__effective_from,
        effectiveTo: row.wc__effective_to,
        wasteTypeId: row.wc__waste_type_id,
        wasteGroupId: row.wc__waste_group_id,
        wasteCharacteristicsId: row.wc__waste_characteristics_id,
        wasteCode: row.wc__waste_code,
        wasteBagColorCode: row.wc__waste_bag_color_code,
        storageRuleType: row.wc__storage_rule_type,
        useColdStorage: row.wc__use_cold_storage,
        coldStorageMinHours: row.wc__cold_storage_min_hours,
        coldStorageMaxHours: row.wc__cold_storage_max_hours,
        tempStorageMinHours: row.wc__temp_storage_min_hours,
        tempStorageMaxHours: row.wc__temp_storage_max_hours,
        minimunDecayDay: row.wc__minimun_decay_day,
        storageRule: row.wc__storage_rule,
        allowHealthcareFacilityTreatment: row.wc__allow_healthcare_facility_treatment,
        isActive: row.wc__is_active,
        hasMultipleTransporters: row.wc__has_multiple_transporters,
        treatmentMethod: row.wc__treatment_method,
        disposalMethod: row.wc__disposal_method,
        allowedVehicleTypes: row.wc__allowed_vehicle_types,
        wasteType: {
          id: row.wt__id,
          name: row.wt__name,
          nameEn: row.wt__name_en,
          parentHierarchyId: row.wt__parent_hierarchy_id,
        },
        wasteGroup: {
          id: row.wg__id,
          name: row.wg__name,
          nameEn: row.wg__name_en,
          parentHierarchyId: row.wg__parent_hierarchy_id,
        },
        wasteCharacteristics: {
          id: row.wch__id,
          name: row.wch__name,
          nameEn: row.wch__name_en,
          isResidue: row.wch__is_residue,
          parentHierarchyId: row.wch__parent_hierarchy_id,
        },
      }
    : undefined;

  const processWastebagEnd = handleAnalisisProcessCount(
    wasteClassification?.disposalMethod,
    wasteClassification?.treatmentMethod,
    Boolean(row.is_treated),
    row.waste_group_ids,
    row.waste_status,
  );

  return new WasteBag({
    id: row.id,
    healthcareFacilityId: row.healthcare_facility_id,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    isDisposed: Boolean(row.is_disposed),
    isTreated: Boolean(row.is_treated),
    wasteSourceId: row.waste_source_id,
    wasteClassificationId: row.waste_classification_id,
    scaleMethod: row.scale_method,
    weightInKgs: row.weight_in_kgs,
    wasteBagQrCodeId: row.waste_bag_qr_code_id,
    wasteStatus: row.waste_status,
    ownedBy: row.owned_by,
    updatedBy: row.updated_by,
    wasteStatusUpdatedAt: row.waste_status_updated_at
      ? new Date(row.waste_status_updated_at)
      : undefined,
    wasteStatusUpdatedBy: row.waste_status_updated_by,
    transportationStatus: row.transportation_status,
    transportationStatusUpdatedAt: row.transportation_status_updated_at
      ? new Date(row.transportation_status_updated_at)
      : undefined,
    transportationStatusUpdatedBy: row.transportation_status_updated_by,
    storageStartTimestamp: row.storage_start_timestamp,
    scheduledStorageEndDatetime: row.scheduled_storage_end_datetime,
    actualStorageEndDatetime: row.actual_storage_end_timestamp,
    maxStorageHours: row.max_storage_hours,
    minimumStorageHours: row.min_storage_hours,
    wasteTreatmentGroupId: row.waste_treatment_group_id,
    wasteTransportationGroupId: row.waste_transportation_group_id,
    wasteTreatmentExternalGroupId: row.waste_treatment_external_group_id,
    wasteTransportationExternalGroupId: row.waste_transportation_external_group_id,
    binNumber: row.bin_number,
    iotMethod: row.iot_method,
    manifestDocNumber: row.manifest_doc_number,
    manifestDocPath: row.manifest_doc_path,
    treatmentStartTime: row.treatment_start_time,
    treatmentEndTime: row.treatment_end_time,
    wasteGroupIds: row.waste_group_ids,
    treatmentLocationId: row.treatment_location_id,
    wasteSource: row.ws__id
      ? {
          id: row.ws__id,
          healthcareFacilityId: row.ws__healthcare_facility_id,
          sourceType: row.ws__source_type,
          internalSourceName: row.ws__internal_source_name,
          internalTreatmentName: row.ws__internal_treatment_name,
          externalHealthcareFacilityId: row.ws__external_healthcare_facility_id,
          externalHealthcareFacilityName: row.ws__external_healthcare_facility_name,
          isActive: Boolean(row.ws__is_active),
          isResidue: Boolean(row.ws__is_residue),
        }
      : undefined,
    transportationGroup: row.tag__id
      ? {
          id: row.tag__id,
          totalBagsCount: row.tag__total_bags_count,
          totalWeightInKgs: row.tag__total_weight_in_kgs,
          transporterVehicleId: row.tag__transporter_vehicle_id,
          transporterOperatorId: row.tag__transporter_operator_id,
          handoverLattitude: row.tag__handover_lattitude,
          handoverLongitude: row.tag__handover_longitude,
          transportationStatus: row.tag__transportation_status,
          isReadOnly: Boolean(row.tag__is_read_only),
          groupId: row.tag__group_id,
        }
      : undefined,
    treatmentGroup: row.tg__id
      ? {
          id: row.tg__id,
          totalBagsCount: row.tg__total_bags_count,
          totalWeightInKgs: row.tg__total_weight_in_kgs,
          treatmentAssetId: row.tg__treatment_asset_id,
          treatmentOperatorId: row.tg__treatment_operator_id,
          handoverLattitude: row.tg__handover_lattitude,
          handoverLongitude: row.tg__handover_longitude,
          treatmentStatus: row.tg__treatment_status,
          isReadOnly: Boolean(row.tg__is_read_only),
          groupId: row.tg__group_id,
        }
      : undefined,
    transportationExternalGroup: row.taeg__id
      ? {
          id: row.taeg__id,
          totalBagsCount: row.taeg__total_bags_count,
          transporterId: row.taeg__transporter_id,
          totalWeightInKgs: row.taeg__total_weight_in_kgs,
          transporterVehicleId: row.taeg__transporter_vehicle_id,
          transporterOperatorId: row.taeg__transporter_operator_id,
          handoverLattitude: row.taeg__handover_lattitude,
          handoverLongitude: row.taeg__handover_longitude,
          transportationStatus: row.taeg__transportation_status,
          handoverTimestamp: row.taeg__handover_timestamp,
          isReadOnly: Boolean(row.taeg__is_read_only),
          groupId: row.taeg__group_id,
        }
      : undefined,
    treatmentExternalGroup: row.teg__id
      ? {
          id: row.teg__id,
          totalBagsCount: row.teg__total_bags_count,
          totalWeightInKgs: row.teg__total_weight_in_kgs,
          treatmentOperatorId: row.teg__treatment_operator_id,
          transportationStatus: row.teg__transportation_status,
          isReadOnly: Boolean(row.teg__is_read_only),
          groupId: row.teg__group_id,
        }
      : undefined,
    wasteClassification,
    logHistory,
    processWastebagEnd,
  });
}
