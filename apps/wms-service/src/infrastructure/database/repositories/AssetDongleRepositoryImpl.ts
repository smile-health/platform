import AssetDongle from '../../../domain/entities/AssetDongle';
import { AssetDongleModel, AsetDongleAttributes } from '../models/AssetDongleModel';
import {
    checkExistingData,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op } from 'sequelize';
import AssetDongleRepository from '../../../domain/repositories/AssetDongleRepository';
import HealthcareAssetModel from '../models/HealthcareAssetModel';

export default class AssetDongleRepositoryImpl implements AssetDongleRepository {
    async createAssetDongle(assetModel: AssetDongle): Promise<void> {
        try {
            if (
                !assetModel.assetId
            ) {
                throw new Error('Missing required fields for AssetDongleModel');
            }
            const createModelObj: AsetDongleAttributes = {
                assetId: assetModel.assetId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            console.log('createModelObj:', createModelObj);
            await AssetDongleModel.create(createModelObj);
            console.log('AssetDongleModel created successfully');
        } catch (error) {
            console.error('Error creating AssetDongleModel:', error);
            throw new Error('Error creating AssetDongleModel');
        }
    }

    async getAllAssetDongle(
        limit: number = 10,
        page: number = 1,
        search: string | undefined = undefined,
    ): Promise<{
        data: AssetDongle[];
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

            const { count, rows } = await AssetDongleModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'desc']],
                distinct: true,
                where: {
                    ...(search
                        ? {
                              assetId: { [Op.like]: `%${search}%` },
                          }
                        : undefined),
                },
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    return new AssetDongle({
                        assetId: m.assetId,
                        createdAt: m.get('created_at'),
                        updatedAt: m.get('updated_at') as Date,
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

    async deleteAssetDongle(assetId: string, deletedBy?: number): Promise<void | null> {
        try {
            const existingData = (await checkExistingData(AssetDongleModel, assetId)) as any;
            if (!existingData) {
                console.error(`No asset model found for ID ${assetId}`);
                return null;
            }
            //set null assetId in table
            const healthcareAsset = await HealthcareAssetModel.findOne({
                where:{
                    assetId: assetId,
                }
            })
            if(healthcareAsset){
                healthcareAsset.set('assetId', null as any);
                await healthcareAsset.save();
            }
            if (deletedBy) await existingData.update({ deletedBy });
            return await existingData.destroy();
        } catch (error) {
            console.error('Error deleting asset model:', error);
            throw new Error('Error deleting asset model');
        }
    }
}
