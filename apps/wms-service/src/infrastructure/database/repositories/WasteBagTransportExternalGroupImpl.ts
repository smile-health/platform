import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteTransportationExternalGroupModel from '../models/WasteTransportationExternalGroupModel';
import WasteTransportationExternalGroupRepository from '../../../domain/repositories/WasteTransportationExternalGroupRepository';
import { WasteTransportationExternalGroupAttributes } from '../models/WasteTransportationExternalGroupModel';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import InfraRegistry from '../../../infrastructure/database/repositories/infraRegistry';
import { getTotalWeightFromWasteBags } from '../../../shared/utils/wasteMiscellaneous';
import WasteTransportationExternalGroup from '../../../domain/entities/WasteTransportationExternalGroup';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteBagModel from '../models/WasteBagModel';
import generateWasteGroupId from '../../../shared/utils/generateWasteGroupId';
import WasteClassificationModel from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../models/WasteHierarchyModel';
import { PartnerVehicleModel } from '../models/PartnerVehicleModel';
import { getEntityDetail } from '../../external-apis/thirdPartyClient';
import { handleAnalisisProcessCount } from '../../../shared/utils/countProsessEvent';
import { getWasteBagLogHistory } from '../../../shared/utils/wasteBagLogHistory';
import { fromZonedTime } from 'date-fns-tz';
import { normalizeUtcRange } from '../../../shared/utils/normalizeUtcRange';
import {
  buildBagWasteClassification,
  buildGroupWasteClassificationSummary,
} from '../../../shared/utils/wasteClassificationSummary';

export default class WasteBagTransportationExternalGroupImpl
  implements WasteTransportationExternalGroupRepository
{
  async createWasteTransportationExternalGroup(
    wasteBagIds: string[],
    payload: WasteTransportationExternalGroup,
    entityId: number,
    providerType: string,
  ): Promise<WasteTransportationExternalGroup | null> {
    try {
      const wasteBags = await InfraRegistry.wasteBagRepositoryImpl!.getWasteBagsByIds(wasteBagIds);

      if (!wasteBags?.length) {
        throw new Error('Waste bag not found for the given ids');
      }

      let status:
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        | 'SPECIALIZED_TREATMENT_PROVIDER';

      // const parse = classification?.disposalMethod
      switch (providerType) {
        case 'TRANSPORTER_LANDFILL':
          status = 'TRANSPORTER_LANDFILL';
          break;
        case 'TRANSPORTER_RECYCLER':
          status = 'TRANSPORTER_RECYCLER';
          break;
        case 'SPECIALIZED_TREATMENT_PROVIDER':
          status = 'SPECIALIZED_TREATMENT_PROVIDER';
          break;
        case 'TRANSPORTER_GOVERNMENT':
          status = 'TRANSPORTER_GOVERNMENT';
          break;
        case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
          status = 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
          break;
        default:
          status = 'TRANSPORTER_TREATMENT';
          break;
      }

      const groupId = generateWasteGroupId(wasteBagIds, status);

      const createModelObj: WasteTransportationExternalGroupAttributes = {
        createdBy: payload.createdBy,
        updatedBy: payload.createdBy,
        totalBagsCount: wasteBags.length,
        totalWeightInKgs: Number(parseFloat(getTotalWeightFromWasteBags(wasteBags).toString())),
        transporterId: payload.transporterId,
        transporterVehicleId: payload.transporterVehicleId,
        transporterOperatorId: payload.transporterOperatorId,
        handoverLattitude: payload.handoverLattitude,
        handoverLongitude: payload.handoverLongitude,
        transportationStatus: 'READY_FOR_TRANSPORT',
        handoverTimestamp: payload.handoverTimestamp,
        treatmentProviderId: payload.treatmentProviderId,
        treatmentOperatorId: payload.treatmentOperatorId,
        isReadOnly: payload.isReadOnly,
        groupId: groupId,
        updated_at: new Date(),
        created_at: new Date(),
      };

      const created = await WasteTransportationExternalGroupModel.create(createModelObj);
      console.log('Waste Transportation External Group created successfully');

      const result = created.get({ plain: true });

      if (!created.id) {
        throw new Error(
          'Failed to retrieve ID from newly created WasteTransportationExternalGroup.',
        );
      }

      return new WasteTransportationExternalGroup({
        id: created.id ?? result.id,
        createdBy: result.createdBy as string,
        updatedBy: result.updatedBy,
        createdAt: result.created_at as Date,
        updatedAt: result.updated_at,
        totalBagsCount: result.totalBagsCount,
        totalWeightInKgs: result.totalWeightInKgs,
        transporterId: result.transporterId,
        transporterVehicleId: result.transporterVehicleId,
        transporterOperatorId: result.transporterOperatorId,
        handoverLattitude: result.handoverLattitude,
        handoverLongitude: result.handoverLongitude,
        transportationStatus: result.transportationStatus,
        handoverTimestamp: result.handoverTimestamp,
        treatmentProviderId: result.treatmentProviderId,
        treatmentOperatorId: result.treatmentOperatorId,
        isReadOnly: result.isReadOnly,
        groupId: result.groupId,
      });
    } catch (error) {
      console.error('Error creating Waste Transportation Extenal Group Group:', error);
      throw new Error('Error creating Waste Transportation Extenal Group Group ' + error);
    }
  }

  async createWasteTransportationExternalGroupFromBags(
    wasteBags: WasteBagModel[],
    wasteBagIds: string[],
    payload: WasteTransportationExternalGroup,
    entityId: number,
    providerType: string,
  ): Promise<WasteTransportationExternalGroup | null> {
    try {
      if (!wasteBags?.length) {
        throw new Error('Waste bag not found for the given ids');
      }

      let status:
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        | 'SPECIALIZED_TREATMENT_PROVIDER';

      switch (providerType) {
        case 'TRANSPORTER_LANDFILL':
          status = 'TRANSPORTER_LANDFILL';
          break;
        case 'TRANSPORTER_RECYCLER':
          status = 'TRANSPORTER_RECYCLER';
          break;
        case 'SPECIALIZED_TREATMENT_PROVIDER':
          status = 'SPECIALIZED_TREATMENT_PROVIDER';
          break;
        case 'TRANSPORTER_GOVERNMENT':
          status = 'TRANSPORTER_GOVERNMENT';
          break;
        case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
          status = 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
          break;
        default:
          status = 'TRANSPORTER_TREATMENT';
          break;
      }

      const groupId = generateWasteGroupId(wasteBagIds, status);

      const createModelObj: WasteTransportationExternalGroupAttributes = {
        createdBy: payload.createdBy,
        updatedBy: payload.createdBy,
        totalBagsCount: wasteBags.length,
        totalWeightInKgs: Number(parseFloat(getTotalWeightFromWasteBags(wasteBags).toString())),
        transporterId: payload.transporterId,
        transporterVehicleId: payload.transporterVehicleId,
        transporterOperatorId: payload.transporterOperatorId,
        handoverLattitude: payload.handoverLattitude,
        handoverLongitude: payload.handoverLongitude,
        transportationStatus: 'READY_FOR_TRANSPORT',
        handoverTimestamp: payload.handoverTimestamp,
        treatmentProviderId: payload.treatmentProviderId,
        treatmentOperatorId: payload.treatmentOperatorId,
        isReadOnly: payload.isReadOnly,
        groupId: groupId,
        updated_at: new Date(),
        created_at: new Date(),
      };

      const created = await WasteTransportationExternalGroupModel.create(createModelObj);

      const result = created.get({ plain: true });

      if (!created.id) {
        throw new Error(
          'Failed to retrieve ID from newly created WasteTransportationExternalGroup.',
        );
      }

      return new WasteTransportationExternalGroup({
        id: created.id ?? result.id,
        createdBy: result.createdBy as string,
        updatedBy: result.updatedBy,
        createdAt: result.created_at as Date,
        updatedAt: result.updated_at,
        totalBagsCount: result.totalBagsCount,
        totalWeightInKgs: result.totalWeightInKgs,
        transporterId: result.transporterId,
        transporterVehicleId: result.transporterVehicleId,
        transporterOperatorId: result.transporterOperatorId,
        handoverLattitude: result.handoverLattitude,
        handoverLongitude: result.handoverLongitude,
        transportationStatus: result.transportationStatus,
        handoverTimestamp: result.handoverTimestamp,
        treatmentProviderId: result.treatmentProviderId,
        treatmentOperatorId: result.treatmentOperatorId,
        isReadOnly: result.isReadOnly,
        groupId: result.groupId,
      });
    } catch (error) {
      console.error('Error creating Waste Transportation Extenal Group Group:', error);
      throw new Error('Error creating Waste Transportation Extenal Group Group ' + error);
    }
  }

  async updateWasteTransportationExternalGroup(
    wasteTransportationGroup: WasteTransportationExternalGroup,
  ): Promise<void | null> {
    try {
      if (!wasteTransportationGroup.id || !wasteTransportationGroup.updatedBy) {
        throw new Error('Missing required fields for WasteTransportationExternalGroup update');
      }

      const existingData = (await checkExistingData(
        WasteTransportationExternalGroupModel,
        wasteTransportationGroup.id,
      )) as any;

      if (!existingData) {
        console.error(
          `Waste Transportation Group Group with ID ${wasteTransportationGroup.id} not found`,
        );
        return null;
      }

      const updateModelObj = {
        updatedBy: wasteTransportationGroup.updatedBy,
        updatedAt: new Date(),
        transporterVehicleId: wasteTransportationGroup.transporterVehicleId,
        transporterOperatorId: wasteTransportationGroup.transporterOperatorId,
        handoverLattitude: wasteTransportationGroup.handoverLattitude,
        handoverLongitude: wasteTransportationGroup.handoverLongitude,
        transportationStatus: wasteTransportationGroup.transportationStatus,
        handoverTimestamp: wasteTransportationGroup.handoverTimestamp,
        treatmentProviderId: wasteTransportationGroup.treatmentProviderId,
        treatmentOperatorId: wasteTransportationGroup.treatmentOperatorId,
        isReadOnly: wasteTransportationGroup.isReadOnly,
      };

      await existingData.update(updateModelObj);
      console.log('Waste Transportation Group Group updated successfully');
    } catch (error) {
      console.error('Error updating Waste Transportation Group Group:', error);
      throw new Error('Error updating Waste Transportation Group Group');
    }
  }

  async deleteWasteTransportationExternalGroup(id: string, deletedBy?: number): Promise<boolean | null> {
    try {
      const existingData = (await checkExistingData(
        WasteTransportationExternalGroupModel,
        id,
      )) as any;

      if (!existingData) {
        console.error(`Waste Transportation Group Group with ID ${id} not found`);
        return null;
      }

      if (deletedBy) await WasteTransportationExternalGroupModel.update({ deletedBy }, { where: { id } });
      await WasteTransportationExternalGroupModel.destroy({
        where: { id },
      });
      console.log('Waste Transportation Group Group deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting Waste Transportation Group Group:', error);
      throw new Error('Error deleting Waste Transportation Group Group');
    }
  }

  async getAllWasteTransportExternalGroup(
    limit: number,
    page: number,
    token: string,
    roles?: string,
    entityId?: number,
    startDate?: Date,
    endDate?: Date,
    status?:
      | 'IN_TEMPORARY_STORAGE'
      | 'IN_COLD_STORAGE'
      | 'INCINERATION_IN_PROCESS'
      | 'STERILIZATION_IN_PROCESS'
      | 'INCINERATED'
      | 'STERILISED'
      | 'READY_FOR_TRANSPORT'
      | 'TRANSPORTATION_REQUEST_CREATED'
      | 'IN_TRANSIT'
      | 'READY_FOR_TREATMENT'
      | 'RECYCLED'
      | 'LANDFILLED'
      | 'COLLECTED'
      | 'DISPOSED',
    anotherStatus?:
      | 'IN_TEMPORARY_STORAGE'
      | 'IN_COLD_STORAGE'
      | 'INCINERATION_IN_PROCESS'
      | 'STERILIZATION_IN_PROCESS'
      | 'INCINERATED'
      | 'STERILISED'
      | 'READY_FOR_TRANSPORT'
      | 'TRANSPORTATION_REQUEST_CREATED'
      | 'IN_TRANSIT'
      | 'READY_FOR_TREATMENT'
      | 'RECYCLED'
      | 'LANDFILLED'
      | 'COLLECTED'
      | 'DISPOSED',
    treatment?:
      | 'TRANSPORTER_LANDFILL'
      | 'TRANSPORTER_RECYCLER'
      | 'TRANSPORTER_TREATMENT'
      | 'TRANSPORTER_GOVERNMENT'
      | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
      | 'SPECIALIZED_TREATMENT_PROVIDER',
    treatmentMethod?: string,
    healthcareFacilityId?: number,
    transportationStatus?: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED' | 'IN_TRANSIT',
  ): Promise<{
    data: WasteTransportationExternalGroup[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      console.time('TOTAL:getAllWasteTransportExternalGroup');
      let groupIdPattern: string | undefined;

      // Determine groupId pattern based on treatment
      if (treatment) {
        switch (treatment) {
          case 'TRANSPORTER_LANDFILL':
            groupIdPattern = '2EX-';
            break;
          case 'TRANSPORTER_RECYCLER':
            groupIdPattern = '3EX-';
            break;
          case 'SPECIALIZED_TREATMENT_PROVIDER':
            groupIdPattern = '4EX-';
            break;
          case 'TRANSPORTER_GOVERNMENT':
            groupIdPattern = '5EX-';
            break;
          case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
            groupIdPattern = '6EX-';
            break;
          case 'TRANSPORTER_TREATMENT':
            groupIdPattern = '1EX-';
            break;
          default:
            groupIdPattern = undefined;
            break;
        }
      }

      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });

      const role = roles?.replaceAll('_', ' ').toLowerCase();

      let listStatus: string[] = [status as string, anotherStatus as string];

      if (role?.includes('recycler')) {
        listStatus.push('RECYCLED');
      }
      if (role?.includes('specialized')) {
        listStatus.push('COLLECTED');
      }
      if (role?.includes('goverment') || role?.includes('wastebank')) {
        listStatus.push('DISPOSED', 'HANDOVER_TO_TREATMENT', 'READY_FOR_TREATMENT', 'LANDFILLED');
      }
      if (roles === 'operator_transporter') {
        listStatus.push(
          'INCINERATION_IN_PROCESS',
          'STERILIZATION_IN_PROCESS',
          'HANDOVER_TO_TREATMENT',
          'READY_FOR_TREATMENT',
          'DISPOSED',
          'RECYCLED',
          'COLLECTED',
          'LANDFILLED',
        );
      }

      listStatus = [...new Set(listStatus.filter(Boolean)), ...(status?.split(',') || [])];
      listStatus = [...new Set(listStatus)];

      const bagConditions: string[] = [];
      const bagReplacements: Record<string, any> = {};

      if (entityId) {
        bagConditions.push(
          `(wb.healthcare_facility_id = :bagEntityId OR wb.transporter_id = :bagEntityId OR wb.third_party_id = :bagEntityId)`,
        );
        bagReplacements.bagEntityId = entityId;
      }

      if (healthcareFacilityId) {
        bagConditions.push(`wb.healthcare_facility_id = :healthcareFacilityId`);
        bagReplacements.healthcareFacilityId = healthcareFacilityId;
      }

      if (listStatus && listStatus.length > 0) {
        bagConditions.push(`wb.waste_status IN (:bagStatuses)`);
        bagReplacements.bagStatuses = listStatus;
      }

      const mainConditions: string[] = [];
      const mainReplacements: Record<string, any> = {};

      if (startDate && endDate) {
        const utcStart = startDate instanceof Date ? startDate : new Date(startDate);
        let utcEnd = endDate instanceof Date ? endDate : new Date(endDate);
        const isMidnight =
          utcEnd.getUTCHours() === 0 &&
          utcEnd.getUTCMinutes() === 0 &&
          utcEnd.getUTCSeconds() === 0 &&
          utcEnd.getUTCMilliseconds() === 0;
        if (isMidnight && utcEnd.getTime() === utcStart.getTime()) {
          utcEnd = new Date(utcEnd);
          utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);
        }
        mainConditions.push(`wtpeg.created_at >= :startDate AND wtpeg.created_at < :endDate`);
        mainReplacements.startDate = utcStart;
        mainReplacements.endDate = utcEnd;
      }

      if (groupIdPattern) {
        mainConditions.push(`wtpeg.group_id LIKE :groupIdPattern`);
        mainReplacements.groupIdPattern = `${groupIdPattern}%`;
      }

      if (transportationStatus) {
        mainConditions.push(`wtpeg.transportation_status = :transportationStatus`);
        mainReplacements.transportationStatus = transportationStatus;
      }

      let disposalPattern: string | undefined;
      if (role?.includes('recycler')) {
        disposalPattern = '%TRANSPORTER_RECYCLER%';
      } else if (role?.includes('specialized')) {
        disposalPattern = '%SPECIALIZED_TREATMENT_PROVIDER%';
      } else if (role?.includes('goverment')) {
        disposalPattern = '%TRANSPORTER_GOVERNMENT%';
      } else if (role?.includes('waste bank')) {
        disposalPattern = '%TRANSPORTER_GOVERNMENT_WASTE_BANK%';
      }

      if (treatmentMethod || disposalPattern) {
        const classChecks: string[] = [];
        if (treatmentMethod) classChecks.push('wc_sub.treatment_method = :treatmentMethod');
        if (disposalPattern) classChecks.push('wc_sub.disposal_method LIKE :disposalPattern');
        bagConditions.push(
          `EXISTS (SELECT 1 FROM waste_classification wc_sub WHERE wc_sub.id = wb.waste_classification_id AND ${classChecks.join(' AND ')})`,
        );
        bagReplacements.treatmentMethod = treatmentMethod;
        bagReplacements.disposalPattern = disposalPattern;
      }

      const allConditions: string[] = [];
      if (mainConditions.length > 0) allConditions.push(mainConditions.join(' AND '));
      if (bagConditions.length > 0) allConditions.push(bagConditions.join(' AND '));

      const whereSql = allConditions.length > 0 ? `WHERE ${allConditions.join(' AND ')}` : '';
      const allReplacements = { ...mainReplacements, ...bagReplacements };

      console.time('query:count+findAll');
      const countSql = `
        SELECT COUNT(DISTINCT wtpeg.id) AS total
        FROM waste_transportation_external_group wtpeg
        INNER JOIN waste_bag wb ON wb.waste_transportation_external_group_id = wtpeg.id
        ${whereSql}
      `;

      const paginationSql = `
        SELECT wtpeg.id
        FROM waste_transportation_external_group wtpeg
        INNER JOIN waste_bag wb ON wb.waste_transportation_external_group_id = wtpeg.id
        ${whereSql}
        GROUP BY wtpeg.id
        ORDER BY wtpeg.updated_at DESC
        LIMIT :limit OFFSET :offset
      `;

      const [countResult, paginatedRows] = await Promise.all([
        sequelize.query(countSql, {
          replacements: allReplacements,
          type: QueryTypes.SELECT,
        }),
        sequelize.query(paginationSql, {
          replacements: {
            ...allReplacements,
            limit: safeLimit,
            offset: (safePage - 1) * safeLimit,
          },
          type: QueryTypes.SELECT,
        }),
      ]);
      console.timeEnd('query:count+findAll');

      const count = Number((countResult as any[])[0]?.total ?? 0);

      const paginatedIds = (paginatedRows as any[]).map((r) => r.id);

      if (count === 0 || paginatedIds.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            pages: 0,
            currentPage: safePage,
            perPage: safeLimit,
          },
        };
      }

      const dataConditions = [...allConditions, 'wtpeg.id IN (:groupIds)'];
      const dataWhereSql = `WHERE ${dataConditions.join(' AND ')}`;

      const dataSql = `
        SELECT
          wtpeg.id, wtpeg.created_by, wtpeg.updated_by, wtpeg.created_at, wtpeg.updated_at,
          wtpeg.total_bags_count, wtpeg.total_weight_in_kgs, wtpeg.transporter_id,
          wtpeg.transporter_vehicle_id, wtpeg.transporter_operator_id,
          wtpeg.treatment_provider_id, wtpeg.treatment_operator_id,
          wtpeg.handover_lattitude, wtpeg.handover_longitude, wtpeg.handover_timestamp,
          wtpeg.transportation_status, wtpeg.is_read_only, wtpeg.group_id,
          wtpeg.waste_treatment_external_group_id, wtpeg.pickup_at,
          wb.id AS wb__id,
          wb.waste_bag_qr_code_id AS wb__waste_bag_qr_code_id,
          wb.waste_status AS wb__waste_status,
          wb.weight_in_kgs AS wb__weight_in_kgs,
          wb.created_at AS wb__created_at,
          wb.healthcare_facility_name AS wb__healthcare_facility_name,
          wb.waste_status_updated_at AS wb__waste_status_updated_at,
          wb.waste_classification_id AS wb__waste_classification_id,
          wb.healthcare_facility_id AS wb__healthcare_facility_id,
          wb.transporter_id AS wb__transporter_id,
          wb.third_party_id AS wb__third_party_id,
          wb.transporter_name AS wb__transporter_name
        FROM waste_transportation_external_group wtpeg
        INNER JOIN waste_bag wb ON wb.waste_transportation_external_group_id = wtpeg.id
        ${dataWhereSql}
        ORDER BY wtpeg.updated_at DESC
      `;

      const dataRows = await sequelize.query(dataSql, {
        replacements: {
          ...allReplacements,
          groupIds: paginatedIds,
        },
        type: QueryTypes.SELECT,
      });

      const groupedMap = new Map<number, any>();
      for (const row of dataRows as any[]) {
        const groupId = row.id;
        if (!groupedMap.has(groupId)) {
          groupedMap.set(groupId, {
            id: groupId,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            totalBagsCount: row.total_bags_count,
            totalWeightInKgs: row.total_weight_in_kgs,
            transporterId: row.transporter_id,
            transporterVehicleId: row.transporter_vehicle_id,
            transporterOperatorId: row.transporter_operator_id,
            treatmentProviderId: row.treatment_provider_id,
            treatmentOperatorId: row.treatment_operator_id,
            handoverLattitude: row.handover_lattitude,
            handoverLongitude: row.handover_longitude,
            handoverTimestamp: row.handover_timestamp,
            transportationStatus: row.transportation_status,
            isReadOnly: row.is_read_only,
            groupId: row.group_id,
            wasteTreatmentExternalGroupId: row.waste_treatment_external_group_id,
            pickupAt: row.pickup_at,
            wasteBags: [],
          });
        }
        groupedMap.get(groupId)!.wasteBags.push({
          id: row.wb__id,
          wasteBagQrCodeId: row.wb__waste_bag_qr_code_id,
          wasteStatus: row.wb__waste_status,
          weightInKgs: row.wb__weight_in_kgs,
          createdAt: row.wb__created_at,
          healthcareFacilityName: row.wb__healthcare_facility_name,
          wasteStatusUpdatedAt: row.wb__waste_status_updated_at,
          wasteClassificationId: row.wb__waste_classification_id,
          healthcareFacilityId: row.wb__healthcare_facility_id,
          transporterId: row.wb__transporter_id,
          thirdPartyId: row.wb__third_party_id,
          transporterName: row.wb__transporter_name,
        });
      }

      const rows = [...groupedMap.values()];

      const allClassificationIds = [
        ...new Set(
          rows.flatMap((row: any) => {
            return row.wasteBags.map((bag: any) => bag.wasteClassificationId);
          }),
        ),
      ];

      const classifications = await WasteClassificationModel.findAll({
        where: { id: { [Op.in]: allClassificationIds } },
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
            where: { isActive: true },
            attributes: ['id', 'name', 'description', 'isActive', 'nameEn', 'descriptionEn'],
          },
        ],
      });
      const classificationMap = new Map(classifications.map((c) => [c.dataValues.id, c]));

      const partnershipLookups = rows
        .map((row: any) => {
          const firstBag = row.wasteBags?.[0];
          if (!firstBag) return null;
          return {
            healthcareFacilityId: firstBag.healthcareFacilityId,
            wasteClassificationId: firstBag.wasteClassificationId,
            transporterId: firstBag.transporterId,
            thirdPartyId: firstBag.thirdPartyId,
          };
        })
        .filter(Boolean) as Array<{
        healthcareFacilityId: number;
        wasteClassificationId: number;
        transporterId?: number;
        thirdPartyId?: number;
      }>;

      console.time('query:bulkPartnership');
      const partnershipMap =
        (await InfraRegistry.partnershipRepositoryImpl?.getBulkPartnershipData(
          token,
          partnershipLookups,
        )) ?? new Map();
      console.timeEnd('query:bulkPartnership');

      const processedData = rows.map((data: any) => {
        const result = data;
        const firstBag = result.wasteBags?.[0];

        if (!firstBag) return null;

        const partnershipKey = `${firstBag.healthcareFacilityId}-${firstBag.wasteClassificationId}-${firstBag.transporterId || ''}-${firstBag.thirdPartyId || ''}`;
        const partnership = partnershipMap.get(partnershipKey) ?? null;

        const bagClassifications = result.wasteBags.map((bag: any) =>
          classificationMap.get(bag.wasteClassificationId),
        );

        if (!bagClassifications.some(Boolean)) return null;

        const wasteBagsTrimmed = result.wasteBags.map((bag: any) => ({
          id: bag.id,
          wasteBagQrCodeId: bag.wasteBagQrCodeId,
          qr_code: bag.wasteBagQrCodeId,
          wasteStatus: bag.wasteStatus,
          weightInKgs: bag.weightInKgs,
          createdAt: bag.createdAt,
          healthcareFacilityId: bag.healthcareFacilityId,
          healthcareFacilityName: bag.healthcareFacilityName,
          wasteStatusUpdatedAt: bag.wasteStatusUpdatedAt,
          wasteClassification: buildBagWasteClassification(
            classificationMap.get(bag.wasteClassificationId),
          ),
        }));

        const { wasteType, wasteGroup, wasteCharacteristics } =
          buildGroupWasteClassificationSummary(bagClassifications);

        return new WasteTransportationExternalGroup({
          id: result.id,
          createdBy: result.createdBy,
          updatedBy: result.updatedBy,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
          totalBagsCount: result.totalBagsCount,
          totalWeightInKgs: result.totalWeightInKgs,
          transporterId: result.transporterId,
          transporterVehicleId: result.transporterVehicleId,
          transporterOperatorId: result.transporterOperatorId,
          treatmentProviderId: result.treatmentProviderId,
          treatmentOperatorId: result.treatmentOperatorId,
          transportationStatus: result.transportationStatus,
          handoverTimestamp: result.handoverTimestamp,
          isReadOnly: result.isReadOnly,
          groupId: result.groupId,
          providerName: firstBag.transporterName,
          consumerName: firstBag.healthcareFacilityName,
          wasteBags: wasteBagsTrimmed,
          wasteType,
          wasteGroup,
          wasteCharacteristics,
          partnership,
        });
      });

      // Filter out any null results
      const filteredData = processedData.filter(
        (item): item is WasteTransportationExternalGroup => item !== null,
      );

      // Sorting based waste type
      const sortedData = filteredData.sort((a, b) => {
        const wasteTypeIdA = a.wasteType?.id;
        const wasteTypeIdB = b.wasteType?.id;

        // Handle undefined values
        if (!wasteTypeIdA && !wasteTypeIdB) return 0;
        if (!wasteTypeIdA) return 1;
        if (!wasteTypeIdB) return -1;

        return Number(wasteTypeIdA) - Number(wasteTypeIdB);
      });

      const result = paginationUtils.formatPaginationResult(sortedData, count, safeLimit, safePage);
      console.timeEnd('TOTAL:getAllWasteTransportExternalGroup');
      return result;
    } catch (error) {
      console.error('Error find WasteTransportExternalGroup:', error);
      throw new Error('Database error');
    }
  }

  async processInBatches<T, R>(
    items: T[],
    batchSize: number,
    handler: (item: T) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(handler));
      results.push(...batchResults);
    }
    return results;
  }

  async getWasteTransportExternalGroupByIdWithWasteBags(
    token: string,
    id?: number,
    qrCodeId?: string,
  ): Promise<WasteTransportationExternalGroup | null> {
    try {
      const wasteTransportExternalGroup = await WasteTransportationExternalGroupModel.findOne({
        where: {
          ...(id && { id }),
        },
        include: [
          {
            model: WasteBagModel,
            as: 'wasteBags',
            required: true,
            where: {
              ...(qrCodeId && { wasteBagQrCodeId: qrCodeId }),
            },
          },
          {
            model: PartnerVehicleModel,
            as: 'partnerVehicle',
            attributes: ['vehicleNumber'],
          },
        ],
      });

      if (!wasteTransportExternalGroup) {
        return null;
      }

      const result = wasteTransportExternalGroup.get({ plain: true });
      const firstBag = result.wasteBags;

      const rawManifestPath = firstBag[0].manifestDocPath;
      const manifestDocPath = rawManifestPath
        ? await InfraRegistry.s3FileServiceRepositoryImpl!.getPresignedUrl(rawManifestPath)
        : null;

      const distinctWasteClassificationIds = [
        ...new Set(result.wasteBags.map((bag: any) => bag.wasteClassificationId as number)),
      ] as number[];
      const classifications = await WasteClassificationModel.findAll({
        where: { id: { [Op.in]: distinctWasteClassificationIds } },
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
      });
      const classificationMap = new Map(classifications.map((c) => [c.dataValues.id, c]));

      const wasteBags = await Promise.all(
        result.wasteBags.map(async (bag: any) => {
          const logHistory = await getWasteBagLogHistory(bag.id);
          return {
            wasteBagQrCodeId: bag.wasteBagQrCodeId,
            wasteStatus: bag.wasteStatus,
            healthcareFacilityId: bag.healthcareFacilityId,
            healthcareFacilityName: bag.healthcareFacilityName,
            thirdPartyId: bag.thirdPartyId,
            manifestDocNumber: bag.manifestDocNumber,
            manifestDocPath,
            weightInKgs: bag.weightInKgs,
            logHistory,
            treatmentMethod: classificationMap.get(bag.wasteClassificationId)?.dataValues
              ?.treatmentMethod,
            wasteClassification: buildBagWasteClassification(
              classificationMap.get(bag.wasteClassificationId),
            ),
          };
        }),
      );

      const { wasteType, wasteGroup, wasteCharacteristics } =
        buildGroupWasteClassificationSummary([...classificationMap.values()]);

      const partnership =
        await InfraRegistry.partnershipRepositoryImpl?.getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId(
          token,
          firstBag[0].healthcareFacilityId,
          firstBag[0].wasteClassificationId,
          firstBag[0].transporterId,
          firstBag[0].thirdPartyId,
        );

      const vehicleData = await PartnerVehicleModel.findAll({
        where: {
          entityId: firstBag[0].healthcareFacilityId,
          transporterId: firstBag[0].transporterId,
        },
      });

      const primaryClassification = classificationMap.get(firstBag[0].wasteClassificationId);
      const processWastebagEnd = handleAnalisisProcessCount(
        primaryClassification?.dataValues?.disposalMethod,
        primaryClassification?.dataValues?.treatmentMethod,
        firstBag[0].isTreated as boolean,
        firstBag[0].wasteGroupIds,
        firstBag[0].wasteStatus,
      );

      const dataEntityHf = await getEntityDetail(firstBag[0].healthcareFacilityId, token);
      const dataEntityTp = await getEntityDetail(firstBag[0].transporterId, token);

      return new WasteTransportationExternalGroup({
        id: result.id,
        createdBy: result.createdBy,
        updatedBy: result.updatedBy,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        totalBagsCount: result.totalBagsCount,
        totalWeightInKgs: result.totalWeightInKgs,
        transporterId: result.transporterId,
        transporterVehicleId: result.transporterVehicleId,
        transporterVehicleNumber: result.partnerVehicle?.vehicleNumber,
        transporterOperatorId: result.transporterOperatorId,
        treatmentProviderId: result.treatmentProviderId,
        treatmentOperatorId: result.treatmentOperatorId,
        transportationStatus: result.transportationStatus,
        handoverTimestamp: result.handoverTimestamp,
        isReadOnly: result.isReadOnly,
        groupId: result.groupId,
        wasteBags,
        providerName: dataEntityHf?.name,
        consumerName: dataEntityTp?.name,
        wasteType,
        wasteGroup,
        wasteCharacteristics,
        partnership,
        vehicle: vehicleData,
        processWastebagEnd: processWastebagEnd,
      });
    } catch (error) {
      console.error('Error fetching WasteTransportExternalGroup by ID:', error);
      throw new Error('Database error');
    }
  }
}
