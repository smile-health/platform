import HealthcareFacilityAsset from '../../../domain/entities/HealthcareFacilityAsset';
import HealthcareModelRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import UpdateHealthcareFacilityDTO from '../../dtos/UpdateHealthcareFacilityAssetDTO';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';

export default class UpdateHealthcareFacilityUseCase {
    constructor(
        private readonly hfAsset: HealthcareModelRepository,
        private readonly assetModelRepository: AssetModelRepository,
    ) {}

    async execute(
        data: UpdateHealthcareFacilityDTO,
    ): Promise<HealthcareFacilityAsset | null | string> {
        try {
            const {
                id,
                assetId,
                healthcareFacilityId,
                modelId,
                isIotEnable,
                assetStatus,
                updatedBy,
                warrantyStartDate,
                warrantyEndDate,
                yearOfProduction,
            } = data;

            if (!id) {
                throw new Error('ID is required to update an asset model');
            }

            const existingData = await this.hfAsset.getHealthcareFacilityAssetById(id);

            if (!existingData) {
                return null;
            }

            const checkRelationalData = await this.assetModelRepository.getAssetModelById(modelId);

            if (!checkRelationalData) {
                return `Asset model with ID ${modelId} not found`;
            }

            const updatedAssetModel: HealthcareFacilityAsset = new HealthcareFacilityAsset({
                ...existingData,
                assetStatus: assetStatus ?? existingData.assetStatus,
                healthcareFacilityId: healthcareFacilityId ?? existingData.healthcareFacilityId,
                modelId: modelId ?? existingData.modelId,
                isIotEnable: isIotEnable ?? existingData.isIotEnable,
                assetId: assetId ?? existingData.assetId,
                updatedBy: updatedBy,
                updatedAt: new Date(),
                warrantyStartDate: warrantyStartDate ?? existingData.warrantyStartDate,
                warrantyEndDate: warrantyEndDate ?? existingData.warrantyEndDate,
                yearOfProduction: yearOfProduction ?? existingData.yearOfProduction,
            });

            await this.hfAsset.updateHealthcareFacilityAsset(updatedAssetModel);
            console.log('Asset model updated successfully:', updatedAssetModel);
            return updatedAssetModel;
        } catch (error) {
            console.error('Error updating asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
