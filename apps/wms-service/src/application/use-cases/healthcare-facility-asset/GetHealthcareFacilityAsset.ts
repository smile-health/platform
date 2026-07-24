import HealthcareFacilityAsset from '../../../domain/entities/HealthcareFacilityAsset';
import HealthcareModelRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import { UserInfo } from '../../../shared/types/userInfo';

export default class GetHealthcareFacilityAssetModel {
    constructor(private readonly assetModelRepository: HealthcareModelRepository) {}

    async execute(id: number): Promise<HealthcareFacilityAsset | null> {
        try {
            const assetModel = await this.assetModelRepository.getHealthcareFacilityAssetById(id);
            if (!assetModel) {
                console.error(`Asset model with ID ${id} not found`);
                return null;
            }
            console.log('Asset model retrieved successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error retrieving asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async executeAll(
        limit: number,
        page: number,
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
            const assetModels = await this.assetModelRepository.getAllHealthcareFacilityAsset(
                limit,
                page,
                token,
                search,
                healthcareFacilityId,
                assetType,
                manufacturerId,
                isIotEnable,
                assetStatus,
            );
            console.log(`Asset models retrieved successfully`, assetModels);
            return assetModels;
        } catch (error) {
            console.error('Error retrieving asset models:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async executeAllByEntityId(
        limit: number,
        page: number,
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
            const assetModels =
                await this.assetModelRepository.getAllHealthcareFacilityAssetByEntityId(
                    limit,
                    page,
                    userInfo,
                    search,
                    assetType,
                    manufacturerId,
                );
            console.log(`Asset models retrieved successfully`, assetModels);
            return assetModels;
        } catch (error) {
            console.error('Error retrieving asset models:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
