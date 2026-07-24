import HealthcareFacilityAssetActivity from '../entities/HealthcareFacilityAssetActivity';

export default interface HealthcareFacilityAssetActivityRepository {
    createHealthcareFacilityAssetActivity(data: HealthcareFacilityAssetActivity): Promise<void>;
    getAllHealthcareFacilityAssetActivity(
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
    }>;
}
