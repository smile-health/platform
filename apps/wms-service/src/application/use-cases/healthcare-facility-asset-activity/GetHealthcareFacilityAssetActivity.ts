import HealthcareFacilityAssetActivity from '../../../domain/entities/HealthcareFacilityAssetActivity';
import HealthcareFacilityAssetActivityRepository from '../../../domain/repositories/HealthcareFacilityAssetActivityRepository';

export default class GetHealthcareFacilityAssetActivityUseCase {
    constructor(private readonly repo: HealthcareFacilityAssetActivityRepository) {}

    async executeAll(
        limit: number,
        page: number,
        activityType?: string,
        hfAssetId?: number,
    ): Promise<{
        data: HealthcareFacilityAssetActivity[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repo.getAllHealthcareFacilityAssetActivity(
                limit,
                page,
                activityType,
                hfAssetId,
            );
            console.log(
                'Fetched all Healthcare Facility Asset Activity successfully:',
                wasteSources,
            );
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all Healthcare Facility Asset Activity:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
