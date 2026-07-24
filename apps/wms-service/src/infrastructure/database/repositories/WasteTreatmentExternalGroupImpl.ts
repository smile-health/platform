import WasteTreatmentExternalGroupRepository from '../../../domain/repositories/WasteTreatmentExternalGroupRepository';
import WasteBagModel from '../models/WasteBagModel';
import { WasteTreatmentExternalGroupModel } from '../models/WasteTreatmentExternalGroupModel';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op, UniqueConstraintError, QueryTypes } from 'sequelize';
import WasteTransportationExternalGroupModel from '../models/WasteTransportationExternalGroupModel';
import { WasteBagModelAttributes } from '../../../infrastructure/database/models/WasteBagModel';
import InfraRegistry from './infraRegistry';
import WasteTreatmentExternalGroup from '../../../domain/entities/WasteTreatmentExternalGroup';
import WasteClassificationModel from '../../../infrastructure/database/models/WasteClassificationModel';
import WasteHierarchyModel from '../../../infrastructure/database/models/WasteHierarchyModel';
import { PartnerVehicleModel } from '../models/PartnerVehicleModel';
import EntityLocationModel from '../models/EntityLocationModel';
import { handleAnalisisProcessCount } from '../../../shared/utils/countProsessEvent';
import { getWasteBagLogHistory } from '../../../shared/utils/wasteBagLogHistory';
import { fromZonedTime } from 'date-fns-tz';
import { sequelize } from '../db.connection';
import {
  buildBagWasteClassification,
  buildGroupWasteClassificationSummary,
} from '../../../shared/utils/wasteClassificationSummary';

export default class WasteTreatmentExternalGroupImpl
  implements WasteTreatmentExternalGroupRepository
{
  async getWasteTreatmentExternalGroupById(
    id: number,
  ): Promise<WasteTreatmentExternalGroupModel | null> {
    try {
      const wasteTreatmentExternalGroup = await WasteTreatmentExternalGroupModel.findByPk(id);
      return wasteTreatmentExternalGroup || null;
    } catch (error) {
      console.error('Error fetching WasteTreatmentExternalGroup by ID:', error);
      throw new Error('Database error');
    }
  }

  async getWasteTreatmentExternalGroupByIdWithWasteBags(
    token: string,
    id?: number,
    qrCodeId?: string,
  ): Promise<WasteTreatmentExternalGroup | null> {
    try {
      const wasteTreatmentExternalGroup = await WasteTreatmentExternalGroupModel.findOne({
        where: {
          ...(id && {
            id: id,
          }),
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
            model: WasteTransportationExternalGroupModel,
            as: 'transportExternalGroup',
            required: false,
            attributes: ['transporterOperatorId', 'transporterVehicleId'],
          },
        ],
      });

      if (!wasteTreatmentExternalGroup) {
        return null;
      }

      const result = wasteTreatmentExternalGroup.get({ plain: true });
      const firstBag = result.wasteBags[0];

      const rawManifestPath = firstBag.manifestDocPath;
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
          firstBag.healthcareFacilityId,
          firstBag.wasteClassificationId,
          firstBag.transporterId,
          firstBag.thirdPartyId,
        );

      const [vehicleDatas, vehicleData] = await Promise.all([
        PartnerVehicleModel.findAll({
          where: {
            entityId: firstBag.healthcareFacilityId,
            transporterId: firstBag.transporterId,
          },
        }),
        PartnerVehicleModel.findOne({
          where: {
            id: result.transportExternalGroup?.transporterVehicleId || 0,
          },
        }),
      ]);

      const primaryClassification = classificationMap.get(firstBag.wasteClassificationId);
      const processWastebagEnd = handleAnalisisProcessCount(
        primaryClassification?.dataValues?.disposalMethod,
        primaryClassification?.dataValues?.treatmentMethod,
        firstBag.isTreated as boolean,
        firstBag.wasteGroupIds,
        firstBag.wasteStatus,
      );

      const locationTreatment = await EntityLocationModel.findByPk(firstBag.treatmentLocationId);

      return new WasteTreatmentExternalGroup({
        id: result.id,
        createdBy: result.createdBy,
        updatedBy: result.updatedBy,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        totalBagsCount: result.totalBagsCount,
        totalWeightInKgs: result.totalWeightInKgs,
        sourceExternalTransportationGroupId: result.sourceExternalTransportationGroupId,
        treatmentProviderId: result.treatmentProviderId,
        treatmentOperatorId: result.treatmentOperatorId,
        transporterOperatorId: result.transportExternalGroup?.transporterOperatorId,
        transporterVehicleId: result.transportExternalGroup?.transporterVehicleId,
        transporterVehicleNumber: vehicleData?.dataValues?.vehicleNumber,
        transportationStatus: result.transportationStatus,
        isReadOnly: result.isReadOnly,
        groupId: result.groupId,
        wasteBags: wasteBags,
        wasteType,
        wasteGroup,
        wasteCharacteristics,
        partnership: partnership,
        vehicle: vehicleDatas,
        locationTreatment: locationTreatment,
        processWastebagEnd: processWastebagEnd,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Data: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Data');
      }
    }
  }

  async createWasteTreatmentExternalGroup(
    wasteTransportationExternalGroupIds: number[],
    createdBy: string,
    entityId: number,
  ): Promise<
    | Array<{
        id: number;
        transportationGroupId: number;
      }>
    | string
  > {
    try {
      if (!wasteTransportationExternalGroupIds.length) {
        return 'WASTE_TRANSPORTATION_GROUP_NOT_FOUND';
      }

      // Get all waste bags untuk transportation groups yang diberikan
      const wasteBags = await WasteBagModel.findAll({
        where: {
          wasteTransportationExternalGroupId: {
            [Op.in]: wasteTransportationExternalGroupIds,
          },
        },
      });

      if (!wasteBags.length) {
        return 'NOT_FOUND';
      }

      const results = [];

      // Langsung group bags by transportation group dengan type safety
      const bagsByTransportationGroup: Record<number, any[]> = {};

      //? handle jika data transportGroupId sama / duplikat
      wasteBags.forEach((bag) => {
        const transportGroupId = bag.dataValues.wasteTransportationExternalGroupId;

        if (transportGroupId == null) return;

        // Kelompokkan berdasarkan transportGroupId
        if (!bagsByTransportationGroup[transportGroupId]) {
          bagsByTransportationGroup[transportGroupId] = [];
        }
        bagsByTransportationGroup[transportGroupId].push(bag);
      });

      // Buat treatment group untuk setiap transportation group
      for (const [transportGroupId, transportBags] of Object.entries(bagsByTransportationGroup)) {
        const transportGroupIdNum = parseInt(transportGroupId);

        // Ambil transportation group
        const transportationGroup = await WasteTransportationExternalGroupModel.findByPk(
          transportGroupIdNum,
          {
            attributes: ['id', 'groupId', 'totalBagsCount', 'totalWeightInKgs'],
          },
        );

        if (!transportationGroup) {
          return 'TRANSPORTATION_GROUP_NOT_FOUND';
        }

        // Create treatment group
        const wasteTreatmentExternalGroup = await WasteTreatmentExternalGroupModel.create({
          createdBy: createdBy,
          treatmentProviderId: entityId,
          totalBagsCount: transportationGroup.dataValues.totalBagsCount,
          totalWeightInKgs: transportationGroup.dataValues.totalWeightInKgs,
          sourceExternalTransportationGroupId: transportGroupIdNum,
          transportationStatus: 'STORED_FOR_TREATMENT',
          treatmentOperatorId: createdBy,
          updatedBy: createdBy,
          groupId: transportationGroup.dataValues.groupId,
        });

        await sequelize.query(
          `
                        UPDATE waste_transportation_external_group wteg
                        SET wteg.waste_treatment_external_group_id = :wasteTreatmentExternalGroupId
                        WHERE id = :id
                    `,
          {
            replacements: {
              wasteTreatmentExternalGroupId: wasteTreatmentExternalGroup.id!,
              id: transportGroupIdNum,
            },
            type: QueryTypes.UPDATE,
          },
        );

        results.push({
          id: wasteTreatmentExternalGroup.id!,
          transportationGroupId: transportGroupIdNum,
        });
      }

      return results;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Data: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Data');
      }
    }
  }

  async receieveWasteTreatmentExternalGroup(
    qrCodeId: string[],
    createdBy: string,
    entityId: number,
  ): Promise<
    | {
        id: number;
        wasteBag: WasteBagModelAttributes;
      }
    | string
  > {
    try {
      const wasteBag = await WasteBagModel.findOne({
        where: {
          wasteBagQrCodeId: qrCodeId[0],
        },
      });
      if (!wasteBag) {
        return 'Waste not found for the given id';
      }

      if (!wasteBag.dataValues.wasteTransportationExternalGroupId) {
        return 'wasteBag.wasteTransportationExternalGroupId is undefined or null';
      }

      //check partnerhip to TP
      const transporterIdPartnership =
        await InfraRegistry.partnershipRepositoryImpl!.findPartnershipByCondition({
          wasteClassificationId: wasteBag.dataValues.wasteClassificationId,
          partnershipStatus: 'ACTIVE',
          consumerId: wasteBag.dataValues.healthcareFacilityId,
          providerId: entityId,
          transporterId: {
            [Op.not]: null,
          },
        });

      if (!transporterIdPartnership) {
        return 'No transporter partnership found for the given consumer and waste classification';
      }

      const wasteTransportationGroupExternal = await WasteTransportationExternalGroupModel.findOne({
        where: {
          id: wasteBag.dataValues.wasteTransportationExternalGroupId,
        },
      });

      if (!wasteTransportationGroupExternal) {
        return 'wasteTransportationExternalGroup not found';
      }

      await WasteTreatmentExternalGroupModel.update(
        {
          createdBy: createdBy,
          treatmentProviderId: entityId,
          totalBagsCount: wasteTransportationGroupExternal.dataValues.totalBagsCount,
          totalWeightInKgs: wasteTransportationGroupExternal.dataValues.totalWeightInKgs,
          sourceExternalTransportationGroupId: wasteTransportationGroupExternal.dataValues.id,
          transportationStatus: 'READY_FOR_TREATMENT',
          treatmentOperatorId: createdBy,
          updatedBy: createdBy,
        },
        {
          where: {
            id: wasteBag.dataValues.wasteTreatmentExternalGroupId,
          },
        },
      );

      return {
        id: wasteBag.dataValues.wasteTreatmentExternalGroupId as number,
        wasteBag: wasteBag.dataValues,
      };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Data: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Data');
      }
    }
  }

  async steriliseWasteBagExternal(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean | string> {
    try {
      const wasteBag = await WasteBagModel.findAll({
        where: {
          wasteBagQrCodeId: {
            [Op.in]: wasteBagQrCodeIds,
          },
        },
        attributes: ['wasteTreatmentExternalGroupId', 'wasteBagQrCodeId'],
      });

      if (!wasteBag) {
        return 'NOT_FOUND';
      }

      for (const waste in wasteBag) {
        if (!Object.hasOwn(wasteBag, waste)) continue;

        const element = wasteBag[waste];

        await WasteTreatmentExternalGroupModel.update(
          {
            createdBy: createdBy,
            transportationStatus: 'STERILIZATION_IN_PROCESS',
            treatmentOperatorId: createdBy,
            updatedBy: createdBy,
          },
          {
            where: {
              id: element.dataValues.wasteTreatmentExternalGroupId,
            },
          },
        );

        await WasteBagModel.update(
          {
            wasteStatus: 'STERILIZATION_IN_PROCESS',
            updatedBy: createdBy,
            wasteStatusUpdatedAt: new Date(),
            wasteStatusUpdatedBy: createdBy,
            treatmentStartTime: treatmentStartTime,
            treatmentEndTime: treatmentEndTime,
          },
          {
            where: {
              wasteBagQrCodeId: element.dataValues.wasteBagQrCodeId,
            },
          },
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to sterilise:', error);
      return false;
    }
  }

  async incinerateWasteBagExternal(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean | string> {
    try {
      const wasteBag = await WasteBagModel.findAll({
        where: {
          wasteBagQrCodeId: {
            [Op.in]: wasteBagQrCodeIds,
          },
        },
        attributes: ['wasteTreatmentExternalGroupId', 'wasteBagQrCodeId'],
      });

      if (!wasteBag) {
        throw new Error('NOT_FOUND');
      }

      for (const waste in wasteBag) {
        if (!Object.hasOwn(wasteBag, waste)) continue;

        const element = wasteBag[waste];

        await WasteTreatmentExternalGroupModel.update(
          {
            createdBy: createdBy,
            transportationStatus: 'INCINERATION_IN_PROCESS',
            treatmentOperatorId: createdBy,
            updatedBy: createdBy,
          },
          {
            where: {
              id: element.dataValues.wasteTreatmentExternalGroupId,
            },
          },
        );

        await WasteBagModel.update(
          {
            wasteStatus: 'INCINERATION_IN_PROCESS',
            updatedBy: createdBy,
            wasteStatusUpdatedAt: new Date(),
            wasteStatusUpdatedBy: createdBy,
            treatmentStartTime: treatmentStartTime,
            treatmentEndTime: treatmentEndTime,
          },
          {
            where: {
              wasteBagQrCodeId: element.dataValues.wasteBagQrCodeId,
            },
          },
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to incinerate:', error);
      return false;
    }
  }

  async landfilledWasteBagExternal(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean | string> {
    try {
      const wasteBag = await WasteBagModel.findAll({
        where: {
          wasteBagQrCodeId: wasteBagQrCodeIds,
        },
        attributes: ['wasteTreatmentExternalGroupId', 'wasteBagQrCodeId'],
      });

      if (!wasteBag) {
        throw new Error('NOT_FOUND');
      }

      for (const waste in wasteBag) {
        if (!Object.hasOwn(wasteBag, waste)) continue;

        const element = wasteBag[waste];
        await WasteTreatmentExternalGroupModel.update(
          {
            createdBy: createdBy,
            transportationStatus: 'LANDFILLED',
            treatmentOperatorId: createdBy,
            updatedBy: createdBy,
          },
          {
            where: {
              id: element.dataValues.wasteTreatmentExternalGroupId,
            },
          },
        );

        await WasteBagModel.update(
          {
            wasteStatus: 'LANDFILLED',
            updatedBy: createdBy,
            wasteStatusUpdatedAt: new Date(),
            wasteStatusUpdatedBy: createdBy,
            treatmentStartTime: treatmentStartTime,
            treatmentEndTime: treatmentEndTime,
          },
          {
            where: {
              wasteBagQrCodeId: element.dataValues.wasteBagQrCodeId,
            },
          },
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating WasteBag status to landfilled:', error);
      return false;
    }
  }

  async recycledWasteBagExternal(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean> {
    try {
      const wasteBag = await WasteBagModel.findOne({
        where: {
          wasteBagQrCodeId: wasteBagQrCodeIds[0],
        },
      });

      if (!wasteBag) {
        throw new Error('Waste not found for the given id');
      }

      if (!wasteBag.dataValues.wasteTransportationExternalGroupId) {
        throw new Error('wasteBag.wasteTransportationExternalGroupId is undefined or null');
      }

      await WasteTreatmentExternalGroupModel.update(
        {
          createdBy: createdBy,
          transportationStatus: 'RECYCLED',
          treatmentOperatorId: createdBy,
          updatedBy: createdBy,
        },
        {
          where: {
            id: wasteBag.dataValues.wasteTreatmentExternalGroupId,
          },
        },
      );

      await WasteBagModel.update(
        {
          wasteStatus: 'RECYCLED',
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

      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to landfilled:', error);
      return false;
    }
  }

  async disposedWasteBagExternal(
    wasteBagQrCodeIds: string[],
    createdBy: string,
    treatmentStartTime: Date,
    treatmentEndTime: Date,
  ): Promise<boolean> {
    try {
      const wasteBag = await WasteBagModel.findOne({
        where: {
          wasteBagQrCodeId: wasteBagQrCodeIds[0],
        },
      });

      if (!wasteBag) {
        throw new Error('Waste not found for the given id');
      }

      if (!wasteBag.dataValues.wasteTransportationExternalGroupId) {
        throw new Error('wasteBag.wasteTransportationExternalGroupId is undefined or null');
      }

      await WasteTreatmentExternalGroupModel.update(
        {
          createdBy: createdBy,
          transportationStatus: 'DISPOSED',
          treatmentOperatorId: createdBy,
          updatedBy: createdBy,
        },
        {
          where: {
            id: wasteBag.dataValues.wasteTreatmentExternalGroupId,
          },
        },
      );

      await WasteBagModel.update(
        {
          wasteStatus: 'DISPOSED',
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

      return true;
    } catch (error) {
      console.error('Error updating WasteBag status to landfilled:', error);
      return false;
    }
  }

  async getAllWasteTreatmentExternalGroup(
    limit: number,
    page: number,
    token: string,
    entityId?: number,
    startDate?: Date,
    endDate?: Date,
    status?: string,
    roles?:
      | 'operator_landfill'
      | 'operator_treatment'
      | 'operator_recycler'
      | 'operator_waste_bank',
    healthcareFacilityId?: number,
    transportationStatus?:
      | 'STORED_FOR_TREATMENT'
      | 'READY_FOR_TREATMENT'
      | 'INCINERATION_IN_PROCESS'
      | 'STERILIZATION_IN_PROCESS'
      | 'INCINERATED'
      | 'STERILISED'
      | 'LANDFILLED'
      | 'RECYCLED'
      | 'DISPOSED'
      | 'COLLECTED',
  ): Promise<{
    data: WasteTreatmentExternalGroup[];
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

      let wasteClassificationWhere = {};
      if (roles) {
        const disposalMethodConditions: any[] = [];

        switch (roles) {
          case 'operator_landfill':
            disposalMethodConditions.push({
              disposalMethod: {
                [Op.like]: '%TRANSPORTER_LANDFILL%',
              },
            });
            break;
          case 'operator_treatment':
            disposalMethodConditions.push({
              disposalMethod: {
                [Op.like]: '%TRANSPORTER_TREATMENT%',
              },
            });
            disposalMethodConditions.push({
              disposalMethod: {
                [Op.like]: '%TRANSPORTER%',
              },
            });
            break;
          case 'operator_recycler':
            disposalMethodConditions.push({
              disposalMethod: {
                [Op.like]: '%TRANSPORTER_RECYCLER%',
              },
            });
            break;
          case 'operator_waste_bank':
            disposalMethodConditions.push({
              disposalMethod: {
                [Op.like]: '%TRANSPORTER_GOVERNMENT_WASTE_BANK%',
              },
            });
            break;
        }

        wasteClassificationWhere = {
          [Op.or]: disposalMethodConditions,
        };
      }

      const listStatus = [
        status?.toString(),
        'IN_THIRD_PARTY_STORAGE',
        'INCINERATION_IN_PROCESS',
        'STERILIZATION_IN_PROCESS',
        'HANDOVER_TO_TREATMENT',
        'READY_FOR_TREATMENT',
        'RECYCLED',
        'LANDFILLED',
        'COLLECTED',
        'DISPOSED',
      ];

      const wasteClassificationIds = await WasteClassificationModel.findAll({
        attributes: ['id'],
        where: wasteClassificationWhere,
        raw: true,
      }).then((results) => results.map((r) => r.id));

      // const tz = process.env.TIME_ZONE || 'Asia/Jakarta';
      // const startUtc = fromZonedTime(`${startDate} 00:00:00`, tz);
      // const endUtc = fromZonedTime(`${endDate} 23:59:59`, tz);

      const { count, rows } = await WasteTreatmentExternalGroupModel.findAndCountAll({
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        order: [['updated_at', 'DESC']],
        distinct: true,
        where: {
          ...(startDate &&
            endDate && {
              created_at: {
                [Op.gte]: new Date(startDate),
                [Op.lt]: new Date(endDate).setDate(new Date(endDate).getDate() + 1),
              },
            }),
          ...(transportationStatus && { transportationStatus }),
        },
        include: [
          {
            model: WasteBagModel,
            as: 'wasteBags',
            required: true,
            attributes: [
              'id', 'wasteBagQrCodeId', 'wasteStatus', 'weightInKgs', 'createdAt',
              'healthcareFacilityName', 'wasteStatusUpdatedAt',
              'wasteClassificationId', 'healthcareFacilityId', 'transporterId',
              'thirdPartyId', 'transporterName',
            ],
            where: {
              ...(entityId && {
                [Op.or]: [
                  { healthcareFacilityId: entityId },
                  { transporterId: entityId },
                  { thirdPartyId: entityId },
                ],
              }),
              ...(healthcareFacilityId && { healthcareFacilityId }),
              ...(listStatus && {
                wasteStatus: {
                  [Op.in]: listStatus,
                },
              }),
              ...(wasteClassificationIds.length > 0 && {
                wasteClassificationId: {
                  [Op.in]: wasteClassificationIds,
                },
              }),
            },
          },
        ],
      });

      if (count === 0 || rows.length === 0) {
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

      // Bulk fetch classifications once for all rows (avoids N queries inside the loop)
      const allClassificationIds = [
        ...new Set(
          rows.flatMap((row) =>
            (row.get({ plain: true }).wasteBags || []).map((bag: any) => bag.wasteClassificationId),
          ),
        ),
      ] as number[];

      const classificationData = await WasteClassificationModel.findAll({
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
      const classificationMap = new Map(classificationData.map((c) => [c.dataValues.id, c]));

      // Bulk fetch partnerships once for all rows (avoids N API calls inside the loop)
      const partnershipLookups = rows
        .map((row) => {
          const firstBag = row.get({ plain: true }).wasteBags?.[0];
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

      const partnershipMap =
        (await InfraRegistry.partnershipRepositoryImpl?.getBulkPartnershipData(
          token,
          partnershipLookups,
        )) ?? new Map();

      const processedData = rows.map((data: WasteTreatmentExternalGroupModel) => {
        const result = data.get({ plain: true });
        const firstBag = result.wasteBags?.[0];

        if (!firstBag) return null;

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

        const partnershipKey = `${firstBag.healthcareFacilityId}-${firstBag.wasteClassificationId}-${firstBag.transporterId || ''}-${firstBag.thirdPartyId || ''}`;
        const partnership = partnershipMap.get(partnershipKey) ?? null;

        const { wasteType, wasteGroup, wasteCharacteristics } =
          buildGroupWasteClassificationSummary(bagClassifications);

        return new WasteTreatmentExternalGroup({
          id: result.id,
          createdBy: result.createdBy,
          updatedBy: result.updatedBy,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
          totalBagsCount: result.totalBagsCount,
          totalWeightInKgs: result.totalWeightInKgs,
          sourceExternalTransportationGroupId: result.sourceExternalTransportationGroupId,
          treatmentProviderId: result.treatmentProviderId,
          treatmentOperatorId: result.treatmentOperatorId,
          transportationStatus: result.transportationStatus,
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
      const filteredData = processedData.filter((item) => item !== null);

      const sortedData = filteredData.sort(
        (a, b) => Number(a.wasteType?.id ?? 0) - Number(b.wasteType?.id ?? 0),
      );

      return paginationUtils.formatPaginationResult(sortedData, Number(count), safeLimit, safePage);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Data creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Data: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Data');
      }
    }
  }

  async updateWasteTreatmentGroup(
    id: number,
    status: 'RECYCLED' | 'LANDFILLED' | 'COLLECTED' | 'DISPOSED',
  ): Promise<void> {
    try {
      await WasteTreatmentExternalGroupModel.update(
        {
          transportationStatus: status,
        },
        {
          where: {
            id: id,
          },
        },
      );
    } catch (error) {
      console.error('Error update WasteTreatmentExternalGroup:', error);
      throw new Error('Database error');
    }
  }
}
