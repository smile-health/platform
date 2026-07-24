import HealthcareFacilityAsset from '../../../domain/entities/HealthcareFacilityAsset';
import {
    HealthcareFacilityAssetModel,
    HealthcareFacilityAsetAttributes,
} from '../models/HealthcareFacilityAssetModel';
import HealthcareModelRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import {
    checkExistingData,
    checkExistingDataWithColumns,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { UserInfo } from '../../../shared/types/userInfo';
import AssetModelSeq from '../models/AssetModel';
import { literal, UniqueConstraintError, WhereOptions } from 'sequelize';
import AssetManufacturerSeq from '../models/AssetManufacturerModel';
import AssetModel from '../../../domain/entities/AssetModel';
import AssetManufacturer from '../../../domain/entities/AssetManufacturer';
import { Op } from 'sequelize';
import HealthcareFacilityAssetActivityModel from '../models/HealthcareFacilityAssetActivityModel';
import { getEntityDetail } from '../../external-apis/thirdPartyClient';

export default class HealthcareFacilityAssetImpl implements HealthcareModelRepository {
    async createHealthcareFacilityAsset(data: HealthcareFacilityAsset): Promise<void> {
        try {
            if (
                !data.createdBy ||
                !data.createdAt ||
                !data.assetStatus ||
                !data.assetId ||
                !data.healthcareFacilityId ||
                !data.modelId
            ) {
                throw new Error('Missing required fields for HealthcareFacilityAsset');
            }

            const createModelObj: HealthcareFacilityAsetAttributes = {
                createdBy: data.createdBy,
                updatedBy: data.createdBy,
                assetStatus: data.assetStatus,
                healthcareFacilityId: data.healthcareFacilityId,
                assetId: data.assetId,
                modelId: data.modelId,
                isIotEnabled: data.isIotEnable,
                warrantyStartDate: data.warrantyStartDate,
                warrantyEndDate: data.warrantyEndDate,
                yearOfProduction: data.yearOfProduction,
            };

            console.log('createModelObj:', createModelObj);
            await HealthcareFacilityAssetModel.create(createModelObj);
            console.log('HealthcareFacilityAsset created successfully');
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Healthcare facility asset creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating Healthcare facility asset: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating Healthcare facility asset');
            }
        }
    }

    async getHealthcareFacilityAssetById(id: number): Promise<HealthcareFacilityAsset | null> {
        try {
            const existingData: any = await HealthcareFacilityAssetModel.findOne({
                where: {
                    id: id,
                },
                include: [
                    {
                        model: AssetModelSeq,
                        as: 'assetModel',
                        required: true,
                        attributes: ['id', 'name', 'description', 'assetType', 'manufacturerId'],
                        include: [
                            {
                                model: AssetManufacturerSeq,
                                as: 'assetManufacturer',
                                required: true,
                                attributes: ['id', 'name', 'description'],
                            },
                        ],
                    },
                ],
            });

            if (existingData === null) {
                console.error(`existingData with ID ${id} not found`);
                return null;
            }

            const externalData = existingData.get('assetModel') as AssetModel | any;
            const dataManufacturer = externalData.get(
                'assetManufacturer',
            ) as AssetManufacturer | null;

            return new HealthcareFacilityAsset({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.createdBy,
                updatedBy: existingData.updatedBy,
                assetStatus: existingData.assetStatus,
                healthcareFacilityId: existingData.healthcareFacilityId,
                isIotEnable: existingData.isIotEnabled,
                assetId: existingData.assetId,
                modelId: existingData.modelId,
                warrantyStartDate: existingData.warrantyStartDate,
                warrantyEndDate: existingData.warrantyEndDate,
                yearOfProduction: existingData.yearOfProduction,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                assetModel: externalData
                    ? {
                          id: externalData.id,
                          name: externalData.name,
                          description: externalData.description,
                          assetType: externalData.assetType,
                          manufacturerId: externalData.manufacturerId,
                          createdAt: externalData.createdAt,
                          updatedAt: externalData.updatedAt,
                          createdBy: externalData.createdBy,
                          updatedBy: externalData.updatedBy,
                          manufacturer: dataManufacturer
                              ? {
                                    id: dataManufacturer.id,
                                    name: dataManufacturer.name,
                                    description: dataManufacturer.description,
                                    createdBy: dataManufacturer.createdBy,
                                    updatedBy: dataManufacturer.updatedBy,
                                }
                              : undefined,
                      }
                    : undefined,
            });
        } catch (error) {
            console.error('Error retrieving HealthcareFacilityAsset:', error);
            throw new Error('Error retrieving HealthcareFacilityAsset');
        }
    }

    async getAllHealthcareFacilityAsset(
        limit: number = 10,
        page: number = 1,
        token: string,
        search?: string,
        healthcareFacilityId?: number,
        assetType?: string,
        manufacturerId?: number,
        isIotEnable?: number,
        assetStatus?: string,
    ): Promise<{
        data: HealthcareFacilityAsset[];
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

            const { count, rows } = await HealthcareFacilityAssetModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(search
                        ? {
                              [Op.or]: [
                                  literal(`\`assetModel\`.\`name\` LIKE '%${search}%'`),
                                  {
                                      '$assetModel.assetManufacturer.name$': {
                                          [Op.like]: `%${search}%`,
                                      },
                                  },
                              ],
                          }
                        : undefined),
                    ...(healthcareFacilityId && {
                        healthcareFacilityId: healthcareFacilityId,
                    }),
                    ...(isIotEnable && {
                        isIotEnabled: isIotEnable,
                    }),
                    ...(assetStatus ? {
                        assetStatus: assetStatus,
                    } : { assetStatus : 'OPERATIONAL' }),
                },
                include: [
                    {
                        model: AssetModelSeq,
                        as: 'assetModel',
                        required: true,
                        attributes: ['id', 'name', 'description', 'assetType', 'manufacturerId'],
                        where: {
                            ...(assetType && {
                                assetType: assetType,
                            }),
                            ...(manufacturerId && {
                                manufacturerId: manufacturerId,
                            }),
                        },
                        include: [
                            {
                                model: AssetManufacturerSeq,
                                as: 'assetManufacturer',
                                required: true,
                                attributes: ['id', 'name', 'description'],
                            },
                        ],
                    },
                ],
            });
            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (m: any) => {
                        const externalData = m.get('assetModel') as AssetModel | any;
                        const dataManufacturer = externalData.get(
                            'assetManufacturer',
                        ) as AssetManufacturer | null;
                        //get information entity
                        const dataEntity = await getEntityDetail(m.healthcareFacilityId, token);

                        return new HealthcareFacilityAsset({
                            id: m.get('id'),
                            createdBy: m.createdBy,
                            updatedBy: m.updatedBy,
                            assetStatus: m.assetStatus,
                            healthcareFacilityId: m.healthcareFacilityId,
                            isIotEnable: m.isIotEnabled,
                            assetId: m.assetId,
                            modelId: m.modelId,
                            warrantyStartDate: m.warrantyStartDate,
                            warrantyEndDate: m.warrantyEndDate,
                            yearOfProduction: m.yearOfProduction,
                            entityName: dataEntity?.name,
                            createdAt: m.get('created_at'),
                            updatedAt: m.get('updated_at'),
                            assetModel: externalData
                                ? {
                                      id: externalData.id,
                                      name: externalData.name,
                                      description: externalData.description,
                                      assetType: externalData.assetType,
                                      manufacturerId: externalData.manufacturerId,
                                      createdAt: externalData.createdAt,
                                      updatedAt: externalData.updatedAt,
                                      createdBy: externalData.createdBy,
                                      updatedBy: externalData.updatedBy,
                                      manufacturer: dataManufacturer
                                          ? {
                                                id: dataManufacturer.id,
                                                name: dataManufacturer.name,
                                                description: dataManufacturer.description,
                                                createdBy: dataManufacturer.createdBy,
                                                updatedBy: dataManufacturer.updatedBy,
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
            console.error('Error retrieving HealthcareFacilityAssets:', error);
            throw new Error('Error retrieving HealthcareFacilityAssets');
        }
    }

    async updateHealthcareFacilityAsset(data: HealthcareFacilityAsset): Promise<void | null> {
        try {
            if (
                !data.id ||
                !data.updatedBy ||
                !data.assetStatus ||
                !data.assetId ||
                !data.healthcareFacilityId ||
                !data.modelId
            ) {
                throw new Error('Missing required fields for HealthcareFacilityAsset');
            }

            const existingData = (await checkExistingData(
                HealthcareFacilityAssetModel,
                data.id,
            )) as any;

            if (!existingData) {
                console.error(`No asset models found for ID ${data.id}`);
                return null;
            }

            const updateModelObj = {
                id: data.id,
                updatedBy: data.updatedBy,
                assetStatus: data.assetStatus,
                healthcareFacilityId: data.healthcareFacilityId,
                assetId: data.assetId,
                modelId: data.modelId,
                isIotEnabled: data.isIotEnable,
                warrantyStartDate: data.warrantyStartDate,
                warrantyEndDate: data.warrantyEndDate,
                yearOfProduction: data.yearOfProduction,
                updatedAt: new Date(),
            };

            console.log('updateModelObj:', updateModelObj);
            await HealthcareFacilityAssetModel.update(updateModelObj, {
                where: { id: data.id },
            });
            console.log('HealthcareFacilityAsset updated successfully');
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Vehicle creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating Healthcare facility asset: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating Healthcare facility asset');
            }
        }
    }

    async deleteHealthcareFacilityAsset(id: string, deletedBy?: number): Promise<void | null> {
        try {
            const existingData = (await checkExistingData(HealthcareFacilityAssetModel, id)) as any;

            if (!existingData) {
                console.error(`No asset models found for ID ${id}`);
                return null;
            }

            if (deletedBy) await existingData.update({ deletedBy });
            return await existingData.destroy();
        } catch (error) {
            console.error('Error deleting HealthcareFacilityAsset:', error);
            throw new Error('Error deleting HealthcareFacilityAsset');
        }
    }

    async getAllHealthcareFacilityAssetByEntityId(
        limit: number = 10,
        page: number = 1,
        userInfo: UserInfo | null,
        search?: string,
        assetType?: string,
        manufacturerId?: number,
    ): Promise<{
        data: HealthcareFacilityAsset[];
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

            const { count, rows } = await HealthcareFacilityAssetModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    healthcareFacilityId: userInfo?.entity.id,
                    ...(search
                        ? {
                              [Op.or]: [
                                  literal(`\`assetModel\`.\`name\` LIKE '%${search}%'`),
                                  {
                                      '$assetModel.assetManufacturer.name$': {
                                          [Op.like]: `%${search}%`,
                                      },
                                  },
                              ],
                          }
                        : undefined),
                },
                include: [
                    {
                        model: AssetModelSeq,
                        as: 'assetModel',
                        required: true,
                        attributes: ['id', 'name', 'description', 'assetType', 'manufacturerId'],
                        where: {
                            ...(assetType && {
                                assetType: assetType,
                            }),
                            ...(manufacturerId && {
                                manufacturerId: manufacturerId,
                            }),
                        },
                        include: [
                            {
                                model: AssetManufacturerSeq,
                                as: 'assetManufacturer',
                                required: true,
                                attributes: ['id', 'name', 'description'],
                            },
                        ],
                    },
                ],
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (m: any) => {
                        const externalData = m.get('assetModel') as AssetModel | any;
                        const dataManufacturer = externalData.get(
                            'assetManufacturer',
                        ) as AssetManufacturer | null;
                        const dataMaintenanceActivity: any =
                            await HealthcareFacilityAssetActivityModel.findOne({
                                attributes: ['createdAt'],
                                where: {
                                    hfAssetId: m.id,
                                    activityType: 'MAINTENANCE',
                                },
                                order: [['createdAt', 'DESC']],
                            });
                        const dataCalibrationActivity: any =
                            await HealthcareFacilityAssetActivityModel.findOne({
                                attributes: ['createdAt'],
                                where: {
                                    hfAssetId: m.id,
                                    activityType: 'CALIBRATION',
                                },
                                order: [['createdAt', 'DESC']],
                            });

                        return new HealthcareFacilityAsset({
                            id: m.get('id'),
                            createdBy: m.createdBy,
                            updatedBy: m.updatedBy,
                            assetStatus: m.assetStatus,
                            healthcareFacilityId: m.healthcareFacilityId,
                            isIotEnable: m.isIotEnabled,
                            assetId: m.assetId,
                            modelId: m.modelId,
                            warrantyStartDate: m.warrantyStartDate,
                            warrantyEndDate: m.warrantyEndDate,
                            yearOfProduction: m.yearOfProduction,
                            createdAt: m.get('created_at'),
                            updatedAt: m.get('updated_at'),
                            dateCalibrationActivity: dataCalibrationActivity?.createdAt,
                            dateMaintenanceActivity: dataMaintenanceActivity?.createdAt,
                            assetModel: externalData
                                ? {
                                      id: externalData.id,
                                      name: externalData.name,
                                      description: externalData.description,
                                      assetType: externalData.assetType,
                                      manufacturerId: externalData.manufacturerId,
                                      createdAt: externalData.createdAt,
                                      updatedAt: externalData.updatedAt,
                                      createdBy: externalData.createdBy,
                                      updatedBy: externalData.updatedBy,
                                      manufacturer: dataManufacturer
                                          ? {
                                                id: dataManufacturer.id,
                                                name: dataManufacturer.name,
                                                description: dataManufacturer.description,
                                                createdBy: dataManufacturer.createdBy,
                                                updatedBy: dataManufacturer.updatedBy,
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
            console.error('Error retrieving HealthcareFacilityAssets:', error);
            throw new Error('Error retrieving HealthcareFacilityAssets');
        }
    }

    async findHealthcareFacilityAssetByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<HealthcareFacilityAsset | null> {
        const data: any = await checkExistingDataWithColumns(
            HealthcareFacilityAssetModel,
            whereClause,
        );

        if (!data) {
            return null;
        }

        return new HealthcareFacilityAsset({
            id: data.id,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy,
            assetStatus: data.assetStatus,
            healthcareFacilityId: data.healthcareFacilityId,
            isIotEnable: data.isIotEnabled,
            assetId: data.assetId,
            modelId: data.modelId,
            warrantyStartDate: data.warrantyStartDate,
            warrantyEndDate: data.warrantyEndDate,
            yearOfProduction: data.yearOfProduction,
            createdAt: data.get('created_at'),
            updatedAt: data.get('updated_at'),
        });
    }
}
