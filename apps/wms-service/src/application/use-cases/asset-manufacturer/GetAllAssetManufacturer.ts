import AssetManufacturer from '../../../domain/entities/AssetManufacturer';
import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';

export default class GetAllAssetManufacturerUseCase {
    constructor(private readonly assetModelRepository: AssetManufacturerRepository) {}

    async execute(
        limit: number,
        page: number,
        search?: string,
        assetType?: string,
        name?: string,
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
            const assetModels = await this.assetModelRepository.getAllAssetManufacturers(
                limit,
                page,
                search,
                assetType,
                name,
            );
            return assetModels;
        } catch (error) {
            console.error('Error retrieving asset manufacturer:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
