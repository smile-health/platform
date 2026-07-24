
import HealthcareAssetRepository from '../../../domain/repositories/HealthcareAssetRepository';
import HealthcareAsset from '../../../domain/entities/HealthcareAsset';
import CreateHealthcareAssetDTO from '../../dtos/CreateHealthcareAssetDTO';

export default class CreateHealthcareUseCase {
    constructor(
        private readonly assetModelRepository: HealthcareAssetRepository,
    ) {}

    async execute(token: string, data: CreateHealthcareAssetDTO): Promise<HealthcareAsset | string> {
        try {
            const {
                id,
                assetTypeName,
                assetWorkingStatusName,
                healthcareFacilityId,
                assetId,
                createdAt,
                updatedAt,
                status
            } = data;

            const dataInput: HealthcareAsset = new HealthcareAsset({
                id,
                assetTypeName,
                assetWorkingStatusName,
                healthcareFacilityId,
                assetId,
                createdAt,
                updatedAt,
                status
            });

            await this.assetModelRepository.createHealthcareAsset(dataInput);
            console.log('Healthcare Asset created successfully:', dataInput);
            return dataInput;
        } catch (error) {
            console.error('Error creating Healthcare Asset:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
