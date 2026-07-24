import WasteClassification from '../../../domain/entities/WasteClassification';
import { WasteClassificationModel } from '../models/WasteClassificationModel';
import WasteClassificationRepository from './../../../domain/repositories/WasteClassificationRepository';
import {
    checkExistingData,
    checkExistingDataWithColumns,
    checkExistingDataWithJoinMoreThanOne,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteHierarchyModel, { WasteHierarchyAttributes } from '../models/WasteHierarchyModel';
import { literal, Op, WhereOptions } from 'sequelize';
import { getUsersDetail } from '../../external-apis/thirdPartyClient';

export default class WasteClassificationRepositoryImpl implements WasteClassificationRepository {
    async createWasteClassification(wasteClassification: WasteClassification): Promise<void> {
        try {
            if (
                !wasteClassification.regionId ||
                !wasteClassification.createdAt ||
                !wasteClassification.createdBy ||
                !wasteClassification.effectiveFrom ||
                !wasteClassification.effectiveTo ||
                !wasteClassification.wasteTypeId ||
                !wasteClassification.wasteGroupId ||
                !wasteClassification.wasteCharacteristicsId ||
                !wasteClassification.wasteCode ||
                !wasteClassification.wasteBagColorCode ||
                !wasteClassification.disposalMethod
            ) {
                throw new Error('Missing required fields for WasteClassification');
            }
            const createModelObj = {
                regionId: wasteClassification.regionId,
                created_at: wasteClassification.createdAt,
                createdBy: wasteClassification.createdBy,
                updatedBy: wasteClassification.createdBy,
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
            };
            console.log('createModelObj:', createModelObj);
            await WasteClassificationModel.create(createModelObj);
            console.log('WasteClassification created successfully');
        } catch (error) {
            console.error('Error creating WasteClassification:', error);
            throw new Error('Error creating WasteClassification');
        }
    }

    async updateWasteClassification(
        wasteClassification: WasteClassification,
    ): Promise<void | null> {
        try {
            if (!wasteClassification.id || !wasteClassification.updatedBy) {
                throw new Error('Missing required fields for WasteSourceGroup');
            }

            const existingData = (await checkExistingData(
                WasteClassificationModel,
                wasteClassification.id,
            )) as any;

            if (!existingData) {
                console.error(`Waste source group with ID ${wasteClassification.id} not found`);
                return null;
            }
            console.log(wasteClassification.hasMultipleTransporters)
            const updateModelObj = {
                updatedBy: wasteClassification.updatedBy,
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
                treatmentMethod: wasteClassification.treatmentMethod,
                hasMultipleTransporters: wasteClassification.hasMultipleTransporters,
                disposalMethod: wasteClassification.disposalMethod,
                allowedVehicleTypes: wasteClassification.allowedVehicleTypes,
                updatedAt: new Date(),
            };

            await WasteClassificationModel.update(updateModelObj, {
                where: { id: wasteClassification.id },
            });
            console.log('Waste classification updated successfully');
        } catch (error) {
            console.error('Error updating Waste classification:', error);
            throw new Error('Error updating Waste classification' + error);
        }
    }

    async getWasteClassificationById(
        id: number,
        token?: string,
    ): Promise<WasteClassification | null> {
        try {
            const existingDatas = (await checkExistingDataWithJoinMoreThanOne(
                WasteClassificationModel,
                {
                    relation1: {
                        model: WasteHierarchyModel,
                        as: 'wasteType',
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                        required: false,
                    },
                    relation2: {
                        model: WasteHierarchyModel,
                        as: 'wasteGroup',
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                        required: false,
                    },
                    relation3: {
                        model: WasteHierarchyModel,
                        as: 'wasteCharacteristics',
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'isActive',
                            'nameEn',
                            'descriptionEn',
                        ],
                        required: false,
                    },
                },
                id,
            )) as any;

            if (!existingDatas) {
                console.error(`Waste source group with ID ${id} not found`);
                return null;
            }
            const existingData = existingDatas.get({ plain: true });

            let dataUser: any;
            if (token) {
                dataUser = await getUsersDetail(existingData.updatedBy, token);
            }

            const dataWasteType = existingData.wasteType as WasteHierarchyAttributes | null;
            const dataWasteGroup = existingData.wasteGroup as WasteHierarchyAttributes | null;
            const dataWasteCharacteristics =
                existingData.wasteCharacteristics as WasteHierarchyAttributes | null;

            const fullName = [dataUser?.firstname, dataUser?.lastname].filter(Boolean).join(' ');

            const wasteClassificationData = new WasteClassification({
                id: existingData.id as number | undefined,
                createdAt: existingData.created_at as Date,
                updatedAt: existingData.updated_at as Date | undefined,
                updatedBy: existingData.updatedBy,
                createdBy: existingData.createdBy,
                regionId: existingData.regionId as number,
                effectiveFrom: existingData.effectiveFrom as Date,
                effectiveTo: existingData.effectiveTo as Date,
                wasteTypeId: existingData.wasteTypeId as number,
                wasteGroupId: existingData.wasteGroupId as number,
                wasteCharacteristicsId: existingData.wasteCharacteristicsId as number,
                wasteCode: existingData.wasteCode,
                wasteBagColorCode: existingData.wasteBagColorCode,
                storageRuleType: existingData.useColdStorage,
                useColdStorage: existingData.useColdStorage as boolean,
                coldStorageMinHours: existingData.coldStorageMinHours as number,
                coldStorageMaxHours: existingData.coldStorageMaxHours as number,
                tempStorageMinHours: existingData.tempStorageMinHours as number,
                tempStorageMaxHours: existingData.tempStorageMaxHours as number,
                minimunDecayDay: existingData.minimunDecayDay as number,
                storageRule: existingData.storageRule,
                allowHealthcareFacilityTreatment:
                    existingData.allowHealthcareFacilityTreatment as boolean,
                isActive: existingData.isActive as boolean,
                hasMultipleTransporters: existingData.hasMultipleTransporters as boolean,
                treatmentMethod: existingData.treatmentMethod,
                disposalMethod: existingData.disposalMethod,
                allowedVehicleTypes: existingData.allowedVehicleTypes,
                userName: fullName,
                wasteType: dataWasteType
                    ? {
                          id: dataWasteType.id,
                          name: dataWasteType.name,
                          nameEn: dataWasteType.nameEn,
                          regionId: dataWasteType.regionId,
                          description: dataWasteType.description,
                          descriptionEn: dataWasteType.descriptionEn,
                          parentHierarchyId: dataWasteType.parentHierarchyId,
                      }
                    : undefined,
                wasteGroup: dataWasteGroup
                    ? {
                          id: dataWasteGroup.id,
                          name: dataWasteGroup.name,
                          nameEn: dataWasteGroup.nameEn,
                          regionId: dataWasteGroup.regionId,
                          description: dataWasteGroup.description,
                          descriptionEn: dataWasteGroup.descriptionEn,
                          parentHierarchyId: dataWasteGroup.parentHierarchyId,
                      }
                    : undefined,
                wasteCharacteristics: dataWasteCharacteristics
                    ? {
                          id: dataWasteCharacteristics.id,
                          name: dataWasteCharacteristics.name,
                          nameEn: dataWasteCharacteristics.nameEn,
                          regionId: dataWasteCharacteristics.regionId,
                          description: dataWasteCharacteristics.description,
                          descriptionEn: dataWasteCharacteristics.descriptionEn,
                          isResidue: dataWasteCharacteristics.isResidue,
                          parentHierarchyId: dataWasteCharacteristics.parentHierarchyId,
                      }
                    : undefined,
            });

            return wasteClassificationData;
        } catch (error) {
            console.error('Error retrieving waste source group:', error);
            throw new Error('Error retrieving waste source group');
        }
    }

    async getAllWasteClassification(
        limit: number,
        page: number,
        token: string,
        search?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        wasteCode?: string,
        useColdStorage?: boolean,
        updatedAt?: string,
        sortBy: 'wasteCode' | 'useColdStorage' | 'updated_at' = 'updated_at',
        sortOrder: 'ASC' | 'DESC' = 'ASC',
    ): Promise<{
        data: WasteClassification[];
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
            const order: any[] = [];

            // --- Sorting setup ---
            switch (sortBy) {
                case 'wasteCode':
                    order.push(['waste_code', sortOrder]);
                    break;
                case 'useColdStorage':
                    order.push(['use_cold_storage', sortOrder]);
                    break;
                default:
                    order.push(['updated_at', sortOrder]);
                    break;
            }
            if (sortBy !== 'updated_at') order.push(['updated_at', 'DESC']);

            // --- WHERE setup ---
            const where: any = {};

            if (wasteCode) where['waste_code'] = { [Op.like]: `%${wasteCode}%` };
            if (typeof useColdStorage === 'boolean') where['use_cold_storage'] = useColdStorage;
            if (updatedAt) where['updated_at'] = { [Op.gte]: updatedAt };
            if (wasteTypeId) where['waste_type_id'] = wasteTypeId;
            if (wasteGroupId) where['waste_group_id'] = wasteGroupId;
            if (wasteCharacteristicsId) where['waste_characteristics_id'] = wasteCharacteristicsId;

            // --- Search literal condition (with correct alias) ---
            if (search) {
                where[Op.and] = literal(`
                (
                    WasteClassificationModel.waste_code LIKE '%${search}%'
                    OR wasteType.name LIKE '%${search}%'
                    OR wasteType.description LIKE '%${search}%'
                    OR wasteGroup.name LIKE '%${search}%'
                    OR wasteGroup.description LIKE '%${search}%'
                    OR wasteCharacteristics.name LIKE '%${search}%'
                    OR wasteCharacteristics.description LIKE '%${search}%'
                )
            `);
            }

            // --- Query ---
            const { count, rows } = await WasteClassificationModel.findAndCountAll({
                limit: safeLimit,
                offset,
                distinct: true,
                include: [
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteType',
                        required: false,
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteGroup',
                        required: false,
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteCharacteristics',
                        required: false,
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'isActive',
                            'nameEn',
                            'descriptionEn',
                        ],
                    },
                ],
                where,
                order,
            });

            // --- Map and append user names ---
            const formatted = await Promise.all(
                rows.map(async (datas: any) => {
                    const data = datas.get({ plain: true });
                    const dataUser = await getUsersDetail(data.updatedBy, token);
                    const fullName =
                        `${dataUser?.firstname ?? ''} ${dataUser?.lastname ?? ''}`.trim();

                    return new WasteClassification({
                        ...data,
                        userName: fullName,
                    });
                }),
            );

            return paginationUtils.formatPaginationResult(
                formatted,
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving waste classification:', error);
            throw new Error('Error retrieving waste classification');
        }
    }

    async deleteWasteClassification(id: string): Promise<void | number | null> {
        try {
            const existingData = (await checkExistingData(WasteClassificationModel, id)) as any;

            if (!existingData) {
                console.error(`Waste classification with ID ${id} not found`);
                return null;
            }

            const result = await WasteClassificationModel.update(
                {
                    isActive: false,
                },
                { where: { id } },
            );

            return result[0];
        } catch (error) {
            console.error('Error deleting Waste classification:', error);
            throw new Error('Error deleting Waste classification');
        }
    }

    async findWasteClassificationByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<WasteClassification | null> {
        const data: any = await checkExistingDataWithColumns(WasteClassificationModel, whereClause);
        if (!data) {
            return null;
        }

        return new WasteClassification({
            id: data.id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            updatedBy: data.updatedBy,
            createdBy: data.createdBy,
            regionId: data.regionId,
            effectiveFrom: data.effectiveFrom,
            effectiveTo: data.effectiveTo,
            wasteTypeId: data.wasteTypeId,
            wasteGroupId: data.wasteGroupId,
            wasteCharacteristicsId: data.wasteCharacteristicsId,
            wasteCode: data.wasteCode,
            wasteBagColorCode: data.wasteBagColorCode,
            storageRuleType: data.storageRuleType,
            useColdStorage: data.useColdStorage,
            coldStorageMinHours: data.coldStorageMinHours,
            coldStorageMaxHours: data.coldStorageMaxHours,
            tempStorageMinHours: data.tempStorageMinHours,
            tempStorageMaxHours: data.tempStorageMaxHours,
            minimunDecayDay: data.minimunDecayDay,
            storageRule: data.storageRule,
            allowHealthcareFacilityTreatment: data.allowHealthcareFacilityTreatment,
            isActive: data.isActive,
            hasMultipleTransporters: data.hasMultipleTransporters,
            treatmentMethod: data.treatmentMethod,
            disposalMethod: data.disposalMethod,
            allowedVehicleTypes: data.allowedVehicleTypes,
        });
    }
}
