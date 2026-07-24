import HealthcareAsset from '../../../domain/entities/HealthcareAsset';
import HealthcareAssetRepository from '../../../domain/repositories/HealthcareAssetRepository';

export default class GetHealthcareAssetByIdUseCase{
    constructor(private readonly assetModelRepository: HealthcareAssetRepository) {}

    async execute(id: number, token: string, entityId: number, lang?: string): Promise<any> {
        try {
            const assetModel = await this.assetModelRepository.getHealthcareAssetById(id, token, entityId ,lang);
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
}
