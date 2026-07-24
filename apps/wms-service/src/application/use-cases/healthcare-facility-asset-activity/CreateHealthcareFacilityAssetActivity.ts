import HealthcareFacilityAssetActivity from '../../../domain/entities/HealthcareFacilityAssetActivity';
import HealthcareFacilityAssetActivityRepository from '../../../domain/repositories/HealthcareFacilityAssetActivityRepository';
import HealthcareFacilityAssetRepository from '../../../domain/repositories/HealthcareFacilityAssetRepository';
import CreateHealthcareFacilityAssetActivityDTO from '../../dtos/CreateHealthcareFacilityAssetActivityDTO';

export default class CreateHealthcareFacilityAssetActivityModelUseCase {
    constructor(
        private readonly hfAsset: HealthcareFacilityAssetActivityRepository,
        private readonly repoHealthcareFacilityAsset: HealthcareFacilityAssetRepository,
    ) {}

    async execute(
        data: CreateHealthcareFacilityAssetActivityDTO,
    ): Promise<HealthcareFacilityAssetActivity | string> {
        try {
            const {
                createdBy,
                createdAt,
                operatorId,
                hfAssetId,
                activityType,
                startDate,
                endDate,
            } = data;
            let existingData: any =
                await this.repoHealthcareFacilityAsset.getHealthcareFacilityAssetById(hfAssetId);
            if (!existingData) {
                console.error(`Healthcare Facility Asset not found`);
                throw new Error('Healthcare Facility Asset not found');
            }

            const dataInput: HealthcareFacilityAssetActivity = new HealthcareFacilityAssetActivity({
                hfAssetId,
                operatorId,
                createdBy,
                createdAt,
                activityType,
                startDate,
                endDate,
            });
            console.log(dataInput);
            await this.hfAsset.createHealthcareFacilityAssetActivity(dataInput);
            console.log('Healthcare Facility Asset Activity created successfully:', dataInput);
            return dataInput;
        } catch (error) {
            console.error('Error creating Healthcare Facility Asset Activity:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
