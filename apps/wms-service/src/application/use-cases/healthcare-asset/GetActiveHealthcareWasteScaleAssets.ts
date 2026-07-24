import HealthcareAsset from '../../../domain/entities/HealthcareAsset';
import HealthcareAssetRepository from '../../../domain/repositories/HealthcareAssetRepository';

export default class GetActiveHealthcareWasteScaleAssetsUseCase {
  constructor(private readonly assetModelRepository: HealthcareAssetRepository) {}

  async execute(entityId: number, token: string): Promise<any> {
    try {
      const assetModel = await this.assetModelRepository.getActiveHealthcareWasteScaleAssets(
        entityId,
        token,
      );
      if (!assetModel) {
        console.error(`Asset model with entityId ${entityId} not found`);
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
