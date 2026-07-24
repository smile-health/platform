import AssetManufacturer from '../../../domain/entities/AssetManufacturer';
import { AssetManufacturerSeq, AsetManufacturerAttributes } from '../models/AssetManufacturerModel';
import AssetManufacturerRepository from './../../../domain/repositories/AssetManufacturerRepository';
import {
    checkExistingData,
    checkExistingDataWithColumns,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op, WhereOptions } from 'sequelize';

export default class AssetManufacturerRepositoryImpl implements AssetManufacturerRepository {
    async createAssetManufacturer(data: AssetManufacturer): Promise<AsetManufacturerAttributes> {
        try {
            if (!data.createdBy || !data.updatedAt || !data.name) {
                throw new Error('Missing required fields for AssetModel');
            }
            const createModelObj: AsetManufacturerAttributes = {
                createdBy: data.createdBy,
                updatedBy: data.createdBy,
                name: data.name,
                description: data.description,
            };

            console.log('createModelObj:', createModelObj);
            const model = await AssetManufacturerSeq.create(createModelObj);
            const dataAssetManufacturer: AsetManufacturerAttributes = {
                ...createModelObj,
                id: model.dataValues.id,
            };
            console.log('Asset Manufaturer created successfully');
            return dataAssetManufacturer;
        } catch (error) {
            console.error('Error creating Asset Manufaturer:', error);
            throw new Error('Error creating Asset Manufaturer');
        }
    }

    async getAssetManufacturerById(id: string): Promise<AssetManufacturer | null> {
        try {
            const existingData = (await checkExistingData(AssetManufacturerSeq, id)) as any;

            if (!existingData) {
                console.error(`Asset manufacturer with ID ${id} not found`);
                return null;
            }

            return new AssetManufacturer({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.createdBy,
                updatedBy: existingData.updatedBy,
                name: existingData.name,
                description: existingData.description,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at'),
            });
        } catch (error) {
            console.error('Error retrieving asset manufacturer:', error);
            throw new Error('Error retrieving asset manufacturer');
        }
    }

    async getAllAssetManufacturers(
        limit: number = 10,
        page: number = 1,
        search: string | undefined = undefined,
        assetType: string | undefined = undefined,
        name: string | undefined = undefined,
    ): Promise<{
        data: AssetManufacturer[];
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

            const { count, rows } = await AssetManufacturerSeq.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'desc']],
                distinct: true,
                where: {
                    ...(search && {
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { description: { [Op.like]: `%${search}%` } },
                        ],
                    }),
                    ...(name &&
                        name.length > 2 && {
                            name: name,
                        }),
                },
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    return new AssetManufacturer({
                        id: m.get('id') as number | undefined,
                        createdBy: m.createdBy,
                        updatedBy: m.updatedBy,
                        name: m.name,
                        description: m.description,
                        createdAt: m.get('created_at'),
                        updatedAt: m.get('updated_at'),
                    });
                }),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving asset manufacturers:', error);
            throw new Error('Error retrieving asset manufacturers');
        }
    }

    async deleteAssetManufacturer(id: string, deletedBy?: number): Promise<void | null> {
        try {
            const existingData = (await checkExistingData(AssetManufacturerSeq, id)) as any;

            if (!existingData) {
                console.error(`Asset manufacturer with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await existingData.update({ deletedBy });
            return await existingData.destroy();
        } catch (error) {
            console.error('Error retrieving asset manufacturers:', error);
            throw new Error('Error retrieving asset manufacturers');
        }
    }

    async updateAssetManufacturer(data: AssetManufacturer): Promise<void | null> {
        try {
            if (!data.id) {
                throw new Error('Missing required fields for Asset manufacture update');
            }

            const existingData = (await checkExistingData(AssetManufacturerSeq, data.id)) as any;

            if (!existingData) {
                console.error(`Asset manufacturer with ID ${data.id} not found`);
                return null;
            }

            const updateModelObj = {
                updated_by: data.updatedBy,
                updatedAt: new Date(),
                name: data.name,
                description: data.description,
            };

            await AssetManufacturerSeq.update(updateModelObj, {
                where: { id: data.id },
            });
            console.log('Asset manufacture updated successfully');
        } catch (error) {
            console.error('Error updating asset manufacturers:', error);
            throw new Error('Error updating asset manufacturers');
        }
    }

    async findAssetManufacturerByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<AssetManufacturer | null> {
        const data: any = await checkExistingDataWithColumns(AssetManufacturerSeq, whereClause);
        if (!data) {
            return null;
        }
        return new AssetManufacturer({
            id: data.id,
            name: data.name,
            description: data.description,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            updatedBy: data.updated_by,
            createdBy: data.created_by,
        });
    }
}
