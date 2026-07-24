import DashboardWasteHierarchy from '../entities/Dashboard';

export default interface DashboardActivityRepository {
    getActivitySummariesForEntities(
        limit: number,
        page: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        entityTag?: string,
        typeOfProcessing?: string,
    ): Promise<{
        data: DashboardWasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getActivityManualScaleForEntities(
        limit: number,
        page: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        entityTag?: string,
    ): Promise<{
        data: DashboardWasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getUserActivitySummary(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        entityTag?: string,
        typeOfProcessing?: string
    ): Promise<{
        totalEntities: number;
        activeEntities: number;
        inactiveEntities: number;
    }>;

    getActivitySummariesForEntitiesExport(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        entityTag?: string,
        typeOfProcessing?: string,
    ): Promise<Buffer>;
}
