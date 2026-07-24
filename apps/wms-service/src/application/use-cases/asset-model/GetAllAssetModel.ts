import AssetModel from '../../../domain/entities/AssetModel';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';

export default class GetAllAssetModelByIdUseCase {
    constructor(private readonly assetModelRepository: AssetModelRepository) {}

    async execute(
        limit: number,
        page: number,
        search?: string,
        assetType?: string,
        manufacturerId?: number,
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
            const assetModels = await this.assetModelRepository.getAllAssetModels(
                limit,
                page,
                search,
                assetType,
                manufacturerId,
            );
            console.log(`Asset models retrieved successfully:`, assetModels);
            return assetModels;
        } catch (error) {
            console.error('Error retrieving asset models:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
