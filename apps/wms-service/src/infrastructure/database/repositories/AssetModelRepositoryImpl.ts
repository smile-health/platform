import AssetModel from '../../../domain/entities/AssetModel';
import { AssetModelSeq, AsetModelAttributes } from '../models/AssetModel';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';
import {
    checkExistingData,
    checkExistingDataWithJoinMoreThanOne,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import AssetManufacturerSeq from '../models/AssetManufacturerModel';
import { AsetManufacturerAttributes } from '../models/AssetManufacturerModel';
import { Op } from 'sequelize';

export default class AssetModelRepositoryImpl implements AssetModelRepository {
    async createAssetModel(assetModel: AssetModel): Promise<void> {
        try {
            if (
                !assetModel.createdBy ||
                !assetModel.assetType ||
                !assetModel.manufacturerId ||
                !assetModel.name
            ) {
                throw new Error('Missing required fields for AssetModel');
            }
            const createModelObj: AsetModelAttributes = {
                createdBy: assetModel.createdBy,
                updatedBy: assetModel.createdBy,
                assetType: assetModel.assetType,
                manufacturerId: assetModel.manufacturerId,
                name: assetModel.name,
                description: assetModel.description,
                created_at: new Date(),
                updated_at: new Date(),
            };
            console.log('createModelObj:', createModelObj);
            await AssetModelSeq.create(createModelObj);
            console.log('AssetModel created successfully');
        } catch (error) {
            console.error('Error creating AssetModel:', error);
            throw new Error('Error creating AssetModel');
        }
    }

    async getAssetModelById(id: number): Promise<AssetModel | null> {
        try {
            const existingData = (await checkExistingDataWithJoinMoreThanOne(
                AssetModelSeq,
                {
                    relation1: {
                        model: AssetManufacturerSeq,
                        as: 'assetManufacturer',
                        attributes: ['id', 'name', 'description'],
                        required: false,
                    },
                },
                id,
            )) as any;

            if (!existingData) {
                console.error(`Asset model with ID ${id} not found`);
                return null;
            }

            const manufacturerData = existingData.get(
                'assetManufacturer',
            ) as AsetManufacturerAttributes | null;

            console.log('Asset model retrieved successfully:', existingData);
            return new AssetModel({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.createdBy,
                updatedBy: existingData.updatedBy,
                assetType: existingData.assetType,
                manufacturerId: existingData.manufacturerId,
                name: existingData.get('name'),
                description: existingData.get('description'),
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                manufacturer: manufacturerData
                    ? {
                          id: manufacturerData.id,
                          name: manufacturerData.name,
                          description: manufacturerData.description,
                      }
                    : undefined,
            });
        } catch (error) {
            console.error('Error retrieving asset model:', error);
            throw new Error('Error retrieving asset model');
        }
    }

    async getAllAssetModels(
        limit: number = 10,
        page: number = 1,
        search: string | undefined = undefined,
        assetType: string | undefined = undefined,
        manufacturerId: number | undefined = undefined,
    ): Promise<{
        data: AssetModel[];
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

            const { count, rows } = await AssetModelSeq.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'desc']],
                distinct: true,
                where: {
                    ...(search
                        ? {
                              name: { [Op.like]: `%${search}%` },
                          }
                        : undefined),
                    ...(assetType && {
                        asset_type: assetType,
                    }),
                    ...(manufacturerId && {
                        manufacturer_id: manufacturerId,
                    }),
                },
                include: [
                    {
                        model: AssetManufacturerSeq,
                        as: 'assetManufacturer',
                        required: false,
                        attributes: ['id', 'name', 'description'],
                    },
                ],
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    const manufacturerData = m.get(
                        'assetManufacturer',
                    ) as AsetManufacturerAttributes | null;

                    return new AssetModel({
                        id: m.get('id') as number | undefined,
                        createdBy: m.createdBy,
                        updatedBy: m.updatedBy,
                        assetType: m.assetType,
                        manufacturerId: m.manufacturerId,
                        name: m.get('name'),
                        description: m.get('description'),
                        createdAt: m.get('created_at'),
                        updatedAt: m.get('updated_at') as Date,
                        manufacturer: manufacturerData
                            ? {
                                  id: manufacturerData.id,
                                  name: manufacturerData.name,
                                  description: manufacturerData.description,
                              }
                            : undefined,
                    });
                }),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving asset models:', error);
            throw new Error('Error retrieving asset models');
        }
    }

    async deleteAssetModel(id: number, deletedBy?: number): Promise<void | null> {
        try {
            const existingData = (await checkExistingData(AssetModelSeq, id)) as any;
            if (!existingData) {
                console.error(`No asset model found for ID ${id}`);
                return null;
            }
            if (deletedBy) await existingData.update({ deletedBy });
            return await existingData.destroy();
        } catch (error) {
            console.error('Error deleting asset model:', error);
            throw new Error('Error deleting asset model');
        }
    }

    async updateAssetModel(assetModel: AssetModel): Promise<AssetModel | null> {
        try {
            if (
                !assetModel.id ||
                !assetModel.updatedBy ||
                !assetModel.assetType ||
                !assetModel.manufacturerId ||
                !assetModel.name
            ) {
                throw new Error('Missing required fields for AssetModel');
            }

            const existingData = (await checkExistingData(AssetModelSeq, assetModel.id)) as any;

            if (!existingData) {
                console.error(`Asset model with ID ${assetModel.id} not found`);
                return null;
            }

            await existingData.update({
                updated_by: assetModel.updatedBy,
                updatedAt: new Date(),
                assetType: assetModel.assetType,
                manufacturerId: assetModel.manufacturerId,
                name: assetModel.name,
                description: assetModel.description,
            });

            return await this.getAssetModelById(assetModel.id);
        } catch (error) {
            console.error('Error updating asset model:', error);
            throw new Error('Error updating asset model');
        }
    }
}
