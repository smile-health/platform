import AssetDongle from '../../../domain/entities/AssetDongle';
import CreateAssetDongleDTO from '../../dtos/CreateAssetDongleDTO';
import AssetDongleRepository from '../../../domain/repositories/AssetDongleRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import AssetDongleSeq from '../../../infrastructure/database/models/AssetDongleModel';

export default class CreateAssetDongleUseCase {
    constructor(
        private readonly assetModelRepository: AssetDongleRepository,
    ) {}

    async execute(data: CreateAssetDongleDTO): Promise<AssetDongle | string> {
        try {
            const { assetId } = data;
            const existingData = (await checkExistingData(AssetDongleSeq, assetId)) as any;
            if (existingData) {
                return `ALREADY_EXIST_IN_ASSET_ID`;
            }
            const assetModel: AssetDongle = new AssetDongle({
                assetId: assetId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await this.assetModelRepository.createAssetDongle(assetModel);
            console.log('Asset dongle created successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error creating asset dongle:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
