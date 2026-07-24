import HealthcareFacilityAssetRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import DeleteHealthcareFacilityAssetDTO from '../../dtos/DeleteHealthcareFacilityAssetDTO';

export default class DeleteAssetModelUseCase {
    constructor(private readonly model: HealthcareFacilityAssetRepository) {}

    async execute(data: DeleteHealthcareFacilityAssetDTO): Promise<void | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete an asset model');
            }

            return await this.model.deleteHealthcareFacilityAsset(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
