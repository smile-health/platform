import AssetModel from '../../../domain/entities/AssetModel';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';
import UpdateAssetDTO from '../../dtos/UpdateAssetDTO';
import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';

export default class UpdateAssetModelUseCase {
    constructor(
        private readonly assetModelRepository: AssetModelRepository,
        private readonly assetManufacturerRepository: AssetManufacturerRepository,
    ) {}

    async execute(data: UpdateAssetDTO): Promise<AssetModel | null | string> {
        try {
            const { id, name, description, updatedBy, manufacturerId, assetType } = data;

            if (!id) {
                throw new Error('ID is required to update an asset model');
            }

            const checkRelationalData =
                await this.assetManufacturerRepository.getAssetManufacturerById(
                    manufacturerId.toString(),
                );

            if (!checkRelationalData) {
                return `NOT_FOUND_MANUFACTURER`;
            }

            const existingAssetModel = await this.assetModelRepository.getAssetModelById(id);

            if (!existingAssetModel) {
                return null;
            }

            const updatedAssetModel: AssetModel = new AssetModel({
                ...existingAssetModel,
                name: name ?? existingAssetModel.name,
                manufacturerId: manufacturerId ?? existingAssetModel.manufacturerId,
                description: description ?? existingAssetModel.description,
                updatedBy: updatedBy,
                assetType: assetType ?? existingAssetModel.assetType,
                updatedAt: new Date(),
            });

            await this.assetModelRepository.updateAssetModel(updatedAssetModel);
            const dataAssetModel = await this.assetModelRepository.getAssetModelById(data.id);
            return dataAssetModel;
        } catch (error) {
            console.error('Error updating asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
