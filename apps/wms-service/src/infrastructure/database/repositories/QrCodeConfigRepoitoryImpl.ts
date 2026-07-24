import QrCodeConfig from '../../../domain/entities/QrCodeConfig';
import { QrCodeConfigModel, QrCodeConfigAttributes } from '../models/QrCodeConfigModel';
import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteSourceModel from '../../../infrastructure/database/models/WasteSourceModel';
import { WasteSourceAttributes } from '../../../infrastructure/database/models/WasteSourceModel';
import WasteHierarchyModel from '../../../infrastructure/database/models/WasteHierarchyModel';
import { WasteClassificationModel } from '../models/WasteClassificationModel';
import { literal, Op } from 'sequelize';
import { getUsersDetail } from '../../external-apis/thirdPartyClient';

export default class QrCodeConfigRepositoryImpl implements QrCodeConfigRepository {
    async createQrCodeConfig(QrCodeConfig: QrCodeConfig): Promise<void> {
        try {
            if (!QrCodeConfig.createdBy) {
                throw new Error('Missing required fields for QrCodeConfig');
            }
            const createModelObj: QrCodeConfigAttributes = {
                createdBy: QrCodeConfig.createdBy,
                updatedBy: QrCodeConfig.createdBy,
                healthcareFacilityId: QrCodeConfig.healthcareFacilityId,
                wasteClassificationId: QrCodeConfig.wasteClassificationId,
                wasteSourceId: QrCodeConfig.wasteSourceId,
                labelCount: QrCodeConfig.labelCount,
            };
            console.log('createModelObj:', createModelObj);
            await QrCodeConfigModel.create(createModelObj);
            console.log('Waste source created successfully');
        } catch (error) {
            console.error('Error creating Waste source:', error);
            throw new Error('Error creating Waste source');
        }
    }

    async getQrCodeConfigById(id: string): Promise<QrCodeConfig | null> {
        try {
            const existingData: any = await QrCodeConfigModel.findOne({
                where: {
                    id: id,
                },
                include: [
                    {
                        model: WasteSourceModel,
                        as: 'wasteSource',
                        attributes: [
                            'id',
                            'healthcareFacilityId',
                            'sourceType',
                            'internalSourceName',
                            'internalTreatmentName',
                            'externalHealthcareFacilityId',
                            'externalHealthcareFacilityName',
                            'isActive',
                        ],
                        required: false,
                    },
                    {
                        model: WasteClassificationModel,
                        as: 'wasteClassification',
                        required: false,
                        attributes: [
                            'id',
                            'regionId',
                            'effectiveFrom',
                            'effectiveTo',
                            'wasteTypeId',
                            'wasteGroupId',
                            'wasteCharacteristicsId',
                            'wasteCode',
                            'wasteBagColorCode',
                            'storageRuleType',
                            'useColdStorage',
                            'coldStorageMinHours',
                            'coldStorageMaxHours',
                            'tempStorageMinHours',
                            'tempStorageMaxHours',
                            'storageRule',
                            'allowHealthcareFacilityTreatment',
                            'hasMultipleTransporters',
                            'treatmentMethod',
                            'disposalMethod',
                            'allowedVehicleTypes',
                        ],
                        include: [
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteType',
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                required: false,
                            },
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteGroup',
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                required: false,
                            },
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteCharacteristics',
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                required: false,
                            },
                        ],
                    },
                ],
            });

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            const result = existingData.get({ plain: true });

            const externalData = existingData.get('wasteSource') as WasteSourceAttributes | null;
            const externalData2 = result.wasteClassification as any | null;

            return new QrCodeConfig({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.createdBy,
                updatedBy: existingData.updatedBy,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                healthcareFacilityId: existingData.healthcareFacilityId,
                wasteSourceId: existingData.wasteSourceId,
                wasteClassificationId: existingData.wasteClassificationId,
                labelCount: existingData.labelCount,
                wasteSource: externalData
                    ? {
                          id: externalData.id,
                          healthcareFacilityId: externalData.healthcareFacilityId,
                          sourceType: externalData.sourceType,
                          internalSourceName: externalData.internalSourceName,
                          internalTreatmentName: externalData.internalTreatmentName,
                          externalHealthcareFacilityId: externalData.externalHealthcareFacilityId,
                          externalHealthcareFacilityName:
                              externalData.externalHealthcareFacilityName,
                          isActive: externalData.isActive,
                          isResidue: externalData.isResidue,
                      }
                    : undefined,
                wasteClassification: externalData2
                    ? {
                          id: externalData2.id,
                          regionId: externalData2.regionId,
                          effectiveFrom: externalData2.effectiveFrom,
                          effectiveTo: externalData2.effectiveTo,
                          wasteTypeId: externalData2.wasteTypeId,
                          wasteGroupId: externalData2.wasteGroupId,
                          wasteCharacteristicsId: externalData2.wasteCharacteristicsId,
                          wasteCode: externalData2.wasteCode,
                          wasteBagColorCode: externalData2.wasteBagColorCode,
                          storageRuleType: externalData2.storageRuleType,
                          useColdStorage: externalData2.useColdStorage,
                          coldStorageMinHours: externalData2.coldStorageMinHours,
                          coldStorageMaxHours: externalData2.coldStorageMaxHours,
                          tempStorageMinHours: externalData2.tempStorageMinHours,
                          tempStorageMaxHours: externalData2.tempStorageMaxHours,
                          storageRule: externalData2.storageRule,
                          allowHealthcareFacilityTreatment:
                              externalData2.allowHealthcareFacilityTreatment,
                          treatmentMethod: externalData2.treatmentMethod,
                          hasMultipleTransporters: externalData2.hasMultipleTransporters,
                          disposalMethod: externalData2.disposalMethod,
                          allowedVehicleTypes: externalData2.allowedVehicleTypes,
                          wasteType: externalData2?.wasteType
                              ? {
                                    id: externalData2.wasteType.id,
                                    name: externalData2.wasteType.name,
                                    description: externalData2.wasteType.description,
                                    nameEn: externalData2.wasteType.nameEn,
                                    descriptionEn: externalData2.wasteType.descriptionEn,
                                    parentHierarchyId: externalData2.wasteType.parentHierarchyId,
                                }
                              : undefined,
                          wasteGroup: externalData2?.wasteGroup
                              ? {
                                    id: externalData2.wasteGroup.id,
                                    name: externalData2.wasteGroup.name,
                                    description: externalData2.wasteGroup.description,
                                    nameEn: externalData2.wasteGroup.nameEn,
                                    descriptionEn: externalData2.wasteGroup.descriptionEn,
                                    parentHierarchyId: externalData2.wasteGroup.parentHierarchyId,
                                }
                              : undefined,
                          wasteCharacteristics: externalData2?.wasteCharacteristics
                              ? {
                                    id: externalData2.wasteCharacteristics.id,
                                    name: externalData2.wasteCharacteristics.name,
                                    description: externalData2.wasteCharacteristics.description,
                                    nameEn: externalData2.wasteCharacteristics.nameEn,
                                    descriptionEn: externalData2.wasteCharacteristics.descriptionEn,
                                    parentHierarchyId:
                                        externalData2.wasteCharacteristics.parentHierarchyId,
                                }
                              : undefined,
                      }
                    : undefined,
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getOneByWasteSourceId(id: number): Promise<number | undefined> {
        try {
            const existingData = await QrCodeConfigModel.findOne({
                where: {
                    wasteSourceId: id,
                },
                attributes: ['id'],
            });

            return existingData?.get('id') as number | undefined;
        } catch (error) {
            console.error('Error fetching WasteBags by Transport Group ID:', error);
            throw new Error('Database error');
        }
    }

    async getAllQrCodeConfigs(
        limit: number,
        page: number,
        token: string,
        lang: string,
        entity_id: string | number | undefined,
        search: string | undefined = undefined,
        sourceType?: string,
        sortBy?: string,
        sortOrder?: string,
    ): Promise<{
        data: QrCodeConfig[];
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

            const facilityId = typeof entity_id === 'string' ? parseInt(entity_id, 10) : entity_id;
            const order: any[] = [];
            const direction = (sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const orderWithNullLast = (
                tableAlias: string,
                column: string,
                direction: 'ASC' | 'DESC',
            ) => [
                literal(`CASE WHEN ${tableAlias}.${column} IS NULL THEN 1 ELSE 0 END`),
                [literal(`${tableAlias}.${column}`), direction],
            ];
            // --- Sorting setup ---
            switch (sortBy) {
                case 'wasteSourceName':
                    order.push(
                        ...orderWithNullLast('wasteSource', 'internal_source_name', direction),
                        ...orderWithNullLast('wasteSource', 'internal_treatment_name', direction),
                        ...orderWithNullLast(
                            'wasteSource',
                            'external_healthcare_facility_name',
                            direction,
                        ),
                    );
                    break;
                case 'wasteCharacteristicsName':
                    if (lang === 'en') {
                        order.push([
                            { model: WasteClassificationModel, as: 'wasteClassification' },
                            { model: WasteHierarchyModel, as: 'wasteCharacteristics' },
                            'name_en',
                            direction,
                        ]);
                    } else {
                        order.push([
                            { model: WasteClassificationModel, as: 'wasteClassification' },
                            { model: WasteHierarchyModel, as: 'wasteCharacteristics' },
                            'name',
                            direction,
                        ]);
                    }
                    break;

                default:
                    order.push(['updated_at', 'DESC']);
                    break;
            }

            // 🔒 fallback supaya pagination & result stabil
            if (sortBy !== 'updated_at') {
                order.push(['updated_at', 'DESC']);
            }

            const { count, rows } = await QrCodeConfigModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order,
                distinct: true,
                subQuery: false,
                where: {
                    healthcareFacilityId: facilityId,
                    ...(search && {
                        [Op.or]: [
                            {
                                '$wasteSource.internal_source_name$': {
                                    [Op.like]: `%${search}%`,
                                },
                            },
                            {
                                '$wasteSource.internal_treatment_name$': {
                                    [Op.like]: `%${search}%`,
                                },
                            },
                            {
                                '$wasteSource.external_healthcare_facility_name$': {
                                    [Op.like]: `%${search}%`,
                                },
                            },
                            {
                                '$wasteClassification->wasteCharacteristics.name$': {
                                    [Op.like]: `%${search}%`,
                                },
                            },
                        ],
                    }),
                },
                include: [
                    {
                        model: WasteSourceModel,
                        as: 'wasteSource',
                        required: true,
                        attributes: [
                            'id',
                            'healthcareFacilityId',
                            'sourceType',
                            'internalSourceName',
                            'internalTreatmentName',
                            'externalHealthcareFacilityId',
                            'externalHealthcareFacilityName',
                            'isActive',
                        ],
                        where: {
                            ...(sourceType && {
                                sourceType: sourceType,
                            }),
                        },
                    },
                    {
                        model: WasteClassificationModel,
                        as: 'wasteClassification',
                        required: true,
                        attributes: [
                            'id',
                            'regionId',
                            'effectiveFrom',
                            'effectiveTo',
                            'wasteTypeId',
                            'wasteGroupId',
                            'wasteCharacteristicsId',
                            'wasteCode',
                            'wasteBagColorCode',
                            'storageRuleType',
                            'useColdStorage',
                            'coldStorageMinHours',
                            'coldStorageMaxHours',
                            'tempStorageMinHours',
                            'tempStorageMaxHours',
                            'storageRule',
                            'allowHealthcareFacilityTreatment',
                            'hasMultipleTransporters',
                            'treatmentMethod',
                            'disposalMethod',
                            'allowedVehicleTypes',
                        ],
                        include: [
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteType',
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                required: true,
                            },
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteGroup',
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                required: true,
                            },
                            {
                                model: WasteHierarchyModel,
                                as: 'wasteCharacteristics',
                                attributes: [
                                    'id',
                                    'name',
                                    'description',
                                    'nameEn',
                                    'descriptionEn',
                                ],
                                required: true,
                            },
                        ],
                    },
                ],
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows
                        .filter((data: any) => {
                            const m = data.get({ plain: true });
                            const externalData2 = m.wasteClassification;
                            return externalData2 !== null && externalData2 !== undefined;
                        })
                        .map(async (data: any) => {
                            const m = data.get({ plain: true });
                            const externalData = m.wasteSource as WasteSourceAttributes | null;
                            const externalData2 = m.wasteClassification as any | null;
                            const dataUser = await getUsersDetail(m.updatedBy, token);

                            const fullName = [dataUser?.firstname, dataUser?.lastname]
                                .filter(Boolean)
                                .join(' ');

                            return new QrCodeConfig({
                                id: m.id,
                                createdBy: m.createdBy,
                                updatedBy: m.updatedBy,
                                createdAt: m.created_at,
                                updatedAt: m.updated_at as Date,
                                healthcareFacilityId: m.healthcareFacilityId,
                                wasteSourceId: m.wasteSourceId,
                                wasteClassificationId: m.wasteClassificationId,
                                labelCount: m.labelCount,
                                userName: fullName,
                                wasteSource: externalData
                                    ? {
                                          id: externalData.id,
                                          healthcareFacilityId: externalData.healthcareFacilityId,
                                          sourceType: externalData.sourceType,
                                          internalSourceName: externalData.internalSourceName,
                                          internalTreatmentName: externalData.internalTreatmentName,
                                          externalHealthcareFacilityId:
                                              externalData.externalHealthcareFacilityId,
                                          externalHealthcareFacilityName:
                                              externalData.externalHealthcareFacilityName,
                                          isActive: externalData.isActive,
                                          isResidue: externalData.isResidue,
                                      }
                                    : undefined,
                                wasteClassification: externalData2
                                    ? {
                                          id: externalData2.id,
                                          regionId: externalData2.regionId,
                                          effectiveFrom: externalData2.effectiveFrom,
                                          effectiveTo: externalData2.effectiveTo,
                                          wasteTypeId: externalData2.wasteTypeId,
                                          wasteGroupId: externalData2.wasteGroupId,
                                          wasteCharacteristicsId:
                                              externalData2.wasteCharacteristicsId,
                                          wasteCode: externalData2.wasteCode,
                                          wasteBagColorCode: externalData2.wasteBagColorCode,
                                          storageRuleType: externalData2.storageRuleType,
                                          useColdStorage: externalData2.useColdStorage,
                                          coldStorageMinHours: externalData2.coldStorageMinHours,
                                          coldStorageMaxHours: externalData2.coldStorageMaxHours,
                                          tempStorageMinHours: externalData2.tempStorageMinHours,
                                          tempStorageMaxHours: externalData2.tempStorageMaxHours,
                                          storageRule: externalData2.storageRule,
                                          allowHealthcareFacilityTreatment:
                                              externalData2.allowHealthcareFacilityTreatment,
                                          treatmentMethod: externalData2.treatmentMethod,
                                          hasMultipleTransporters: externalData2.hasMultipleTransporters,
                                          disposalMethod: externalData2.disposalMethod,
                                          allowedVehicleTypes: externalData2.allowedVehicleTypes,
                                          wasteType: externalData2?.wasteType
                                              ? {
                                                    id: externalData2.wasteType.id,
                                                    name: externalData2.wasteType.name,
                                                    description:
                                                        externalData2.wasteType.description,
                                                    nameEn: externalData2.wasteType.nameEn,
                                                    descriptionEn:
                                                        externalData2.wasteType.descriptionEn,
                                                    parentHierarchyId:
                                                        externalData2.wasteType.parentHierarchyId,
                                                }
                                              : undefined,
                                          wasteGroup: externalData2?.wasteGroup
                                              ? {
                                                    id: externalData2.wasteGroup.id,
                                                    name: externalData2.wasteGroup.name,
                                                    description:
                                                        externalData2.wasteGroup.description,
                                                    nameEn: externalData2.wasteGroup.nameEn,
                                                    descriptionEn:
                                                        externalData2.wasteGroup.descriptionEn,
                                                    parentHierarchyId:
                                                        externalData2.wasteGroup.parentHierarchyId,
                                                }
                                              : undefined,
                                          wasteCharacteristics: externalData2?.wasteCharacteristics
                                              ? {
                                                    id: externalData2.wasteCharacteristics.id,
                                                    name: externalData2.wasteCharacteristics.name,
                                                    description:
                                                        externalData2.wasteCharacteristics
                                                            .description,
                                                    nameEn: externalData2.wasteCharacteristics
                                                        .nameEn,
                                                    descriptionEn:
                                                        externalData2.wasteCharacteristics
                                                            .descriptionEn,
                                                    parentHierarchyId:
                                                        externalData2.wasteCharacteristics
                                                            .parentHierarchyId,
                                                }
                                              : undefined,
                                      }
                                    : undefined,
                            });
                        }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving waste sources:', error);
            throw new Error('Error retrieving waste sources');
        }
    }

    async updateQrCodeConfig(QrCodeConfig: QrCodeConfig): Promise<void | null> {
        try {
            if (!QrCodeConfig.id || !QrCodeConfig.updatedBy) {
                throw new Error('Missing required fields for QrCodeConfig update');
            }

            const existingData = (await checkExistingData(
                QrCodeConfigModel,
                QrCodeConfig.id,
            )) as any;

            if (!existingData) {
                console.error(`Qr Code Config with ID ${QrCodeConfig.id} not found`);
                return null;
            }

            const updateModelObj: QrCodeConfigAttributes = {
                updatedBy: QrCodeConfig.updatedBy,
                healthcareFacilityId: QrCodeConfig.healthcareFacilityId,
                wasteClassificationId: QrCodeConfig.wasteClassificationId,
                wasteSourceId: QrCodeConfig.wasteSourceId,
                labelCount: QrCodeConfig.labelCount,
            };

            await QrCodeConfigModel.update(updateModelObj, {
                where: { id: QrCodeConfig.id },
            });
            console.log('Qr Code Config updated successfully');
        } catch (error) {
            console.error('Error updating Qr Code Config:', error);
            throw new Error('Error updating Qr Code Config');
        }
    }

    async deleteQrCodeConfig(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(QrCodeConfigModel, id)) as any;

            if (!existingData) {
                console.error(`Qr Code Config with ID ${id} not found`);
                return false;
            }

            if (deletedBy) await existingData.update({ deletedBy });
            await existingData.destroy();
            return true;
        } catch (error) {
            console.error('Error deleting Qr Code Config:', error);
            throw new Error('Error deleting Qr Code Config');
        }
    }
}
