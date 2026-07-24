import AssetModel from '../../../domain/entities/AssetModel';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';

export default class GetAssetModelByIdUseCase {
    constructor(private readonly assetModelRepository: AssetModelRepository) {}

    async execute(id: number): Promise<AssetModel | null> {
        try {
            const assetModel = await this.assetModelRepository.getAssetModelById(id);

            return assetModel;
        } catch (error) {
            console.error('Error retrieving asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
