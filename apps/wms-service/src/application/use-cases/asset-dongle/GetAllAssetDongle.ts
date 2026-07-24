import AssetDongle from '../../../domain/entities/AssetDongle';
import AssetDongleRepository from '../../../domain/repositories/AssetDongleRepository';

export default class GetAllAssetDongleUseCase {
    constructor(private readonly assetModelRepository: AssetDongleRepository) {}

    async execute(
        limit: number,
        page: number,
        search?: string,
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
            const assetModels = await this.assetModelRepository.getAllAssetDongle(
                limit,
                page,
                search,
            );
            console.log(`Asset dongle retrieved successfully:`, assetModels);
            return assetModels;
        } catch (error) {
            console.error('Error retrieving asset dongle:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
