import AssetManufacturer from '../../../domain/entities/AssetManufacturer';
import AssetManufacturerRepository from '../../../domain/repositories/AssetManufacturerRepository';
import { AsetManufacturerAttributes } from '../../../infrastructure/database/models/AssetManufacturerModel';
import CreateAssetManufacturerDTO from '../../dtos/CreateAssetManufacturerDTO';

export default class CreateAssetManufactureUseCase {
    constructor(private readonly assetManufacturerRepository: AssetManufacturerRepository) {}

    async execute(data: CreateAssetManufacturerDTO): Promise<AsetManufacturerAttributes> {
        try {
            const { name, description, createdBy } = data;

            const existingDataAssetManufacturer: any =
                await this.assetManufacturerRepository.findAssetManufacturerByCondition({
                    name: name,
                });
            if (existingDataAssetManufacturer) {
                console.error(`Asset manufacturer with name ${name} already exists`);
                throw new Error(`Asset manufacturer with name ${name} already exists`);
            }

            const assetModel: AssetManufacturer = new AssetManufacturer({
                name,
                description,
                createdBy,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
            });

            const dataAsset =
                await this.assetManufacturerRepository.createAssetManufacturer(assetModel);
            console.log('Asset manufacture created successfully:', dataAsset);
            return { ...assetModel, id: dataAsset.id };
        } catch (error) {
            console.error('Error creating asset manufacture:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
