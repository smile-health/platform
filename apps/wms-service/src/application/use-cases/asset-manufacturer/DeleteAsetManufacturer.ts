import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';
import DeleteAssetManufacturerDTO from '../../dtos/DeleteAssetManufacturerDTO';

export default class DeleteWasteSourceUseCase {
    constructor(private readonly wasteSourceRepository: AssetManufacturerRepository) {}

    async execute(data: DeleteAssetManufacturerDTO): Promise<void | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste source');
            }

            return await this.wasteSourceRepository.deleteAssetManufacturer(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
