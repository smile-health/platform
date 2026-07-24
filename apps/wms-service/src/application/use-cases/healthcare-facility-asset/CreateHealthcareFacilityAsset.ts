import HealthcareFacilityAsset from '../../../domain/entities/HealthcareFacilityAsset';
import HealthcareModelRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import CreateHealthcareFacilityDTO from '../../dtos/CreateHealthcareFacilityAssetDTO';
import AssetModelRepository from '../../../domain/repositories/AssetModelRepository';

export default class CreateHealthcareFacilityModelUseCase {
    constructor(
        private readonly hfAsset: HealthcareModelRepository,
        private readonly assetModelRepository: AssetModelRepository,
    ) {}

    async execute(data: CreateHealthcareFacilityDTO): Promise<HealthcareFacilityAsset | string> {
        try {
            const {
                modelId,
                assetStatus,
                healthcareFacilityId,
                isIotEnable,
                assetId,
                createdBy,
                warrantyStartDate,
                warrantyEndDate,
                yearOfProduction,
            } = data;

            const existingData = await this.assetModelRepository.getAssetModelById(modelId);

            if (!existingData) {
                return `Asset model with ID ${modelId} not found`;
            }

            const dataInput: HealthcareFacilityAsset = new HealthcareFacilityAsset({
                modelId,
                assetStatus,
                healthcareFacilityId,
                assetId,
                isIotEnable,
                createdBy,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
                warrantyStartDate,
                warrantyEndDate,
                yearOfProduction,
            });

            await this.hfAsset.createHealthcareFacilityAsset(dataInput);
            console.log('Healthcare Facility Asset created successfully:', dataInput);
            return dataInput;
        } catch (error) {
            console.error('Error creating Healthcare Facility:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
