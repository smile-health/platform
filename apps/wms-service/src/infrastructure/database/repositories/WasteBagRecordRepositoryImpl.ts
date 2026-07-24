import { Op, UniqueConstraintError } from 'sequelize';
import WasteBagRecord from '../../../domain/entities/WasteBagRecord';
import WasteBagRecordModel, { WasteBagRecordModelAttributes } from '../models/WasteBagRecordModel';
import WasteBagRecordRepository from './../../../domain/repositories/WasteBagRecordRepository';
import InfraRegistry from './infraRegistry';
import { paginationUtils } from '../../../shared/utils/pagination';
import { WasteClassificationAttributes } from '../models/WasteClassificationModel';
import WasteClassificationModel from '../models/WasteClassificationModel';
import WasteHierarchyModel from '../../../infrastructure/database/models/WasteHierarchyModel';
import { WasteSourceAttributes } from '../../../infrastructure/database/models/WasteSourceModel';
import WasteSourceModel from '../../../infrastructure/database/models/WasteSourceModel';
import { getEntityDetail } from '../../external-apis/thirdPartyClient';
import { handleAnalisisProcessCount } from '../../../shared/utils/countProsessEvent';
import { fromZonedTime } from 'date-fns-tz';

export default class WasteBagRecordRepositoryImpl implements WasteBagRecordRepository {
    async getAllWasteBagRecord(
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
    ): Promise<
        {
            date: any;
            totalWeight: any;
            wasteCharacteristics: {
                name: string;
                totalWeight: unknown;
            }[];
        }[]
    > {
        try {
            if (!entityTag) {
                throw new Error('Authorization error');
            }

            const currentTag = entityTag?.toLowerCase();
            let whereClauseEntity: any = {};

            if (currentTag.includes('hospital')) {
                whereClauseEntity = {
                    healthcareFacilityId: entityId,
                };
            } else {
                whereClauseEntity = {
                    [Op.or]: [{ third_party_id: entityId }, { transporterId: entityId }],
                };
            }

            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
            });

            let whereClauseWasteUpdate: any = {};

            if (wasteUpdateStart && wasteUpdateEnd) {
                const tz = process.env.TIME_ZONE || 'Asia/Jakarta';
                const startUtc = fromZonedTime(`${wasteUpdateStart} 00:00:00`, tz);
                const endUtc = fromZonedTime(`${wasteUpdateEnd} 23:59:59`, tz);

                whereClauseWasteUpdate = {
                    [Op.gte]: startUtc,
                    [Op.lte]: endUtc,
                };
            }
            const rows = await WasteBagRecordModel.findAll({
                order: [['createdAt', 'DESC']],
                where: {
                    ...whereClauseEntity,
                    ...(wasteClassificationId &&
                        wasteClassificationId.length > 0 && {
                            wasteClassificationId: {
                                [Op.in]: wasteClassificationId,
                            },
                        }),
                    ...(wasteUpdateStart &&
                        wasteUpdateEnd && {
                            createdAt: whereClauseWasteUpdate,
                        }),
                    ...(transportationGroupId && {
                        wasteTransportationGroupId: transportationGroupId,
                    }),
                    ...(transportationExternalGroupId && {
                        wasteTransportationExternalGroupId: transportationExternalGroupId,
                    }),
                    ...(treatmentGroupId && {
                        wasteTreatmentGroupId: treatmentGroupId,
                    }),
                    ...(treatmentExternalGroupId && {
                        wasteTreatmentExternalGroupId: treatmentExternalGroupId,
                    }),
                    ...(ownedBy && { ownedBy }),
                    ...(wasteStatus && {
                        wasteStatus: {
                            [Op.in]: wasteStatus.split(','),
                        },
                    }),
                    ...(isTreated && { isTreated }),
                    ...(isDisposed && { isDisposed }),
                    ...(binNumber && { binNumber }),
                    ...(wasteBagQrCodeId && { wasteBagQrCodeId }),
                    ...(id && { id }),
                },
                include: [
                    {
                        model: WasteSourceModel,
                        as: 'wasteSource',
                        required: true,
                        where: {
                            ...(sourceType && { source_type: sourceType }),
                        },
                    },
                    {
                        model: WasteClassificationModel,
                        as: 'wasteClassification',
                        required: true,
                        include: [
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteType',
                                required: true,
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                where: {
                                    ...(wasteTypeId && { id: wasteTypeId }),
                                },
                            },
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteGroup',
                                required: true,
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                where: {
                                    ...(wasteGroupId && { id: wasteGroupId }),
                                },
                            },
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteCharacteristics',
                                required: true,
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'isActive',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                where: {
                                    ...(wasteCharacteristicsId && { id: wasteCharacteristicsId }),
                                    ...(search && {
                                        name: {
                                            [Op.like]: `%${search}%`,
                                        },
                                    }),
                                },
                            },
                        ],
                    },
                ],
            });

            const rawRecords = rows.map((m: WasteBagRecordModel) =>
                getWasteBagRecordFromModel(m, true, undefined),
            );

            const groupedByDate: Record<string, any> = {};

            for (const r of rawRecords) {
                const dateValue = r.createdAt || r.updatedAt;
                let date = 'Unknown';
                if (dateValue && !isNaN(new Date(dateValue).getTime())) {
                    date = new Date(dateValue).toISOString().split('T')[0];
                }

                if (!groupedByDate[date]) {
                    groupedByDate[date] = {
                        date,
                        totalBags: 0,
                        totalWeight: 0,
                        listWasteBags: [],
                    };
                }

                const weight = Number(r.weightInKgs || 0);
                groupedByDate[date].totalWeight += weight;

                groupedByDate[date].listWasteBags.push({
                    wasteBagQrCode: r.wasteBagQrCodeId || '-',
                    weightInKgs: weight,
                    wasteType: r.wasteClassification?.wasteType?.name || 'Unknown',
                    date: r.createdAt,
                    wasteGroup: r.wasteClassification?.wasteGroup?.name || 'Unknown',
                    wasteCharacteristics:
                        r.wasteClassification?.wasteCharacteristics?.name || 'Unknown',
                });

                groupedByDate[date].totalBags += 1;
            }

            const finalResult = Object.values(groupedByDate);

            return finalResult;
        } catch (error) {
            console.error('Error fetching WasteBagRecord by ID:', error);
            throw new Error('Database error: ' + error);
        }
    }

    async createWasteBagRecord(
        wasteBag: WasteBagRecord,
        token: string,
    ): Promise<WasteBagRecord | string> {
        try {
            if (
                !wasteBag.wasteBagQrCodeId ||
                !wasteBag.healthcareFacilityId ||
                !wasteBag.createdAt ||
                !wasteBag.createdBy ||
                !wasteBag.wasteSourceId ||
                !wasteBag.wasteClassificationId ||
                !wasteBag.scaleMethod ||
                !wasteBag.wasteStatus ||
                !wasteBag.ownedBy ||
                wasteBag.isTreated === undefined ||
                wasteBag.isDisposed === undefined
            ) {
                return 'MISSING_FIELD';
            }

            // add maximum time if waste classification is need cold storage
            const dataEntity = await getEntityDetail(wasteBag.healthcareFacilityId, token);

            const createModelObj = await WasteBagRecordModel.create({
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
                scaleMethod: wasteBag.scaleMethod,
                weightInKgs: wasteBag?.weightInKgs
                    ? Number(parseFloat(wasteBag?.weightInKgs?.toString() ?? '').toFixed(3))
                    : undefined,
                wasteStatus: 'IN_TEMPORARY_STORAGE',
                ownedBy: wasteBag.ownedBy,
                isTreated: wasteBag.isTreated,
                isDisposed: wasteBag.isDisposed,
                binNumber: wasteBag.binNumber,
                iotMethod: wasteBag.iotMethod,
                wasteGroupIds: wasteBag.wasteGroupIds,
                healthcareFacilityName: dataEntity?.name,
                provinceId: dataEntity?.province_id,
                regencyId: dataEntity?.regency_id,
                districtId: dataEntity?.sub_district_id
                    ? Number(dataEntity?.sub_district_id)
                    : undefined,
                provinceName: dataEntity?.province_name ?? dataEntity?.locations?.[0]?.name,
                regencyName: dataEntity?.regency_name ?? dataEntity?.locations?.[1]?.name,
                districtName: dataEntity?.district_name ?? dataEntity?.locations?.[2]?.name,
                bastNo: wasteBag.bastNo,
                materialIds: wasteBag.materialIds,
            });

            const createdWasteBagRecord = getWasteBagRecordFromModel(createModelObj, false);

            //update isReadonly in waste group treatment
            if (wasteBag.wasteGroupIds) {
                await InfraRegistry.wasteBagTreatmentGroupRepositoryImpl!.updateIsReadOnly(
                    wasteBag.wasteGroupIds,
                );
            }

            return createdWasteBagRecord;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Data creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating WasteBagRecord: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating WasteBagRecord');
            }
        }
    }
}

function getWasteBagRecordFromModel(
    wasteBagModel: WasteBagRecordModel,
    isDetail: boolean,
    event?: any,
): WasteBagRecord {
    const result = wasteBagModel.get({ plain: true }) as WasteBagRecordModelAttributes;

    const wasteSource = result.wasteSource as WasteSourceAttributes | undefined;

    const wasteClassification = result.wasteClassification as
        | WasteClassificationAttributes
        | undefined;

    const processWastebagEnd = handleAnalisisProcessCount(
        wasteClassification?.disposalMethod,
        wasteClassification?.treatmentMethod,
        result.isTreated as boolean,
        result.wasteGroupIds,
        result.wasteStatus
    );

    return new WasteBagRecord({
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
                  allowHealthcareFacilityTreatment:
                      wasteClassification.allowHealthcareFacilityTreatment,
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
    });
}
