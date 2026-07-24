import HealthcareFacilityAsset from '../../../domain/entities/HealthcareFacilityAsset';
import HealthcareModelRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';

export default class UpdateIOTHealthcareFacilityAsset {
    constructor(private readonly model: HealthcareModelRepository) {}

    async execute(id: number, isIotEnable: boolean): Promise<HealthcareFacilityAsset | null> {
        try {
            if (!id) {
                throw new Error('ID is required to update an Healthcare facility asset');
            }

            const existingData = await this.model.getHealthcareFacilityAssetById(id);

            if (!existingData) {
                return null;
            }

            const updatedAssetModel: HealthcareFacilityAsset = new HealthcareFacilityAsset({
                ...existingData,
                isIotEnable: isIotEnable ?? existingData.isIotEnable,
                updatedAt: new Date(),
            });

            await this.model.updateHealthcareFacilityAsset(updatedAssetModel);
            console.log('Asset model updated successfully:', updatedAssetModel);
            return updatedAssetModel;
        } catch (error) {
            console.error('Error updating asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
