import AssetManufacturer from '../../../domain/entities/AssetManufacturer';
import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';
import UpdateAssetManufacturerDTO from '../../dtos/UpdateAssetManufacturerDTO';

export default class UpdateAssetManufactureUseCase {
    constructor(private readonly assetModelRepository: AssetManufacturerRepository) {}

    async execute(data: UpdateAssetManufacturerDTO): Promise<AssetManufacturer | null> {
        try {
            const { id, name, description, updatedBy } = data;

            if (!id) {
                throw new Error('ID is required to update an asset manufacturer');
            }

            const existingAssetModel = await this.assetModelRepository.getAssetManufacturerById(
                id.toString(),
            );

            if (!existingAssetModel) {
                return null;
            }

            const assetModel: AssetManufacturer = new AssetManufacturer({
                ...existingAssetModel,
                name,
                description,
                updatedBy,
                createdBy: updatedBy,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await this.assetModelRepository.updateAssetManufacturer(assetModel);
            console.log('Asset manufacture updated successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error creating asset manufacture:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
