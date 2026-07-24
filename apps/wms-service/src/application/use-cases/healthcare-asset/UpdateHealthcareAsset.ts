import HealthcareAssetRepository from '../../../domain/repositories/HealthcareAssetRepository';
import UpdateHealthcareAssetDTO from '../../dtos/UpdateHealthcareAssetDTO';
import HealthcareAsset from '../../../domain/entities/HealthcareAsset';
import AssetDongleSeq, {
  AssetDongleModel,
} from '../../../infrastructure/database/models/AssetDongleModel';

export default class UpdateHealthcareAssetUseCase {
  constructor(private readonly assetModelRepository: HealthcareAssetRepository) {}

  async execute(
    token: string,
    data: UpdateHealthcareAssetDTO,
  ): Promise<HealthcareAsset | null | string> {
    try {
      const {
        id,
        assetTypeName,
        assetWorkingStatusName,
        healthcareFacilityId,
        assetId,
        createdAt,
        updatedAt,
        status,
      } = data;

      if (!id) {
        throw new Error('ID is required to update an asset model');
      }

      const updatedAssetModel: HealthcareAsset = new HealthcareAsset({
        id,
        assetTypeName,
        assetWorkingStatusName,
        healthcareFacilityId,
        assetId,
        createdAt,
        updatedAt,
        status,
      });

      await this.assetModelRepository.updateHealthcareAsset(updatedAssetModel, token);
      console.log('Asset model updated successfully:', updatedAssetModel);
      return updatedAssetModel;
    } catch (error) {
      console.error('Error updating asset model:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
