import AssetManufacturer from '../../../domain/entities/AssetManufacturer';
import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';

export default class GetAssetManufacturerUseCase {
    constructor(private readonly assetManufacturerRepository: AssetManufacturerRepository) {}

    async execute(id: string): Promise<AssetManufacturer | null> {
        try {
            const assetModel = await this.assetManufacturerRepository.getAssetManufacturerById(id);

            return assetModel;
        } catch (error) {
            console.error('Error retrieving asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
