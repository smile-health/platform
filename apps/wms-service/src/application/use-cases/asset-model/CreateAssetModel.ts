import AssetModel from '../../../domain/entities/AssetModel';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';
import CreateAssetDTO from '../../dtos/CreateAssetDTO';
import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';

export default class CreateAssetModelUseCase {
    constructor(
        private readonly assetModelRepository: AssetModelRepository,
        private readonly assetManufacturerRepository: AssetManufacturerRepository,
    ) {}

    async execute(data: CreateAssetDTO): Promise<AssetModel | string> {
        try {
            const { name, description, createdBy, assetType, manufacturerId } = data;

            const existingData = await this.assetManufacturerRepository.getAssetManufacturerById(
                manufacturerId.toString(),
            );

            if (!existingData) {
                return `NOT_FOUND_MANUFACTURER`;
            }

            const assetModel: AssetModel = new AssetModel({
                manufacturerId,
                name,
                description,
                createdBy,
                assetType,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
            });

            await this.assetModelRepository.createAssetModel(assetModel);
            console.log('Asset model created successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error creating asset model:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
