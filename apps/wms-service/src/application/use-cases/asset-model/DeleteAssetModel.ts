import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';
import HealthcareFacilityAssetRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import DeleteAssetDTO from '../../dtos/DeleteAssetDTO';

export default class DeleteAssetModelUseCase {
    constructor(
        private readonly assetModelRepository: AssetModelRepository,
        private readonly healthcareFacilityAsset: HealthcareFacilityAssetRepository,
    ) {}

    async execute(data: DeleteAssetDTO): Promise<void | null> {
        try {
            const { id } = data;

            let existingDataParent: any =
                await this.healthcareFacilityAsset.findHealthcareFacilityAssetByCondition({
                    model_id: id,
                });
            if (existingDataParent) {
                console.error(
                    `Asset with ID ${id} cannot be deleted because it is still used in the healthcare facility asset.`,
                );
                throw new Error(
                    `Asset with ID ${id} cannot be deleted because it is still used in the healthcare facility asset.`,
                );
            }

            if (!id) {
                throw new Error('ID is required to delete an asset model');
            }

            return await this.assetModelRepository.deleteAssetModel(id, data.deletedBy);
        } catch (error) {
            console.error('Error deleting asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
