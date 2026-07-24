import AssetDongleRepository from '../../../domain/repositories/AssetDongleRepository';
import DeleteAssetDongleDTO from '../../dtos/DeleteAssetDongleDTO';

export default class DeleteAssetDongleUseCase {
    constructor(
        private readonly assetDongleRepository: AssetDongleRepository,
    ) {}

    async execute(data: DeleteAssetDongleDTO): Promise<void | null> {
        try {
            const { assetId } = data;

            if (!assetId) {
                throw new Error('assetId is required to delete an asset dongle');
            }
            return await this.assetDongleRepository.deleteAssetDongle(assetId, data.deletedBy);
        } catch (error) {
            console.error('Error deleting asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
