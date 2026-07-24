import DashboardWasteHierarchy, {
    DashboardHealthcare,
    DashboardWasteCharacteristicsSummary,
    DashboardThirdParty,
    DashboardWasteGroupDetailsByAction,
} from '../entities/Dashboard';

export default interface DashboardRepository {
    getSumaryPerDay(entityId: number): Promise<{
        wasteBagOutResult: {
            totalBags: number;
            totalWeight: string;
        },
        wasteBagThisDay: {
            totalBags: number;
            totalWeight: string;
        }
    }>;

    getSummaryWasteHierarchy(
        limit: number,
        page: number,
        startDate?: string,
        endDate?: string,
    ): Promise<{
        data: DashboardWasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getSummaryWasteHierarchyByProvince(
        limit: number,
        page: number,
        provinceId: number,
        startDate?: string,
        endDate?: string,
    ): Promise<{
        data: DashboardWasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getSummaryWasteHierarchyByCity(
        limit: number,
        page: number,
        token: string,
        cityId: number,
        startDate?: string,
        endDate?: string,
        healthcareFacilityId?: number,
    ): Promise<{
        data: DashboardWasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getWasteGroupByAdminHealthcareFacility(
        limit: number,
        page: number,
        token: string,
        wasteTypeId?: number,
        healthcareFacilityId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        wasteStatus?: string,
        search?: string,
    ): Promise<{
        data: DashboardHealthcare[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getWasteGroupByTransporter(
        limit: number,
        page: number,
        token: string,
        entityId: number,
        healthcareFacilityId?: number,
        provinceId?: number,
        cityId?: number,
        startDate?: string,
        endDate?: string,
        search?: string,
    ): Promise<{
        data: DashboardThirdParty[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getWasteGroupByTreatmentAll(
        limit: number,
        page: number,
        token: string,
        entityId: number,
        disposalTreatment: string,
        healthcareFacilityId?: number,
        provinceId?: number,
        cityId?: number,
        startDate?: string,
        endDate?: string,
        search?: string,
    ): Promise<{
        data: DashboardThirdParty[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getWasteGroupDetailsByAction(
        limit: number,
        page: number,
        wasteGroupId: number,
        treatmentType: string,
    ): Promise<{
        data: DashboardWasteGroupDetailsByAction[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getWasteCharacteristicsSummary(
        wasteTypeId: number,
        provinceId?: number,
        cityId?: number,
        startDate?: string,
        endDate?: string,
        healthcareFacilityId?: number,
    ): Promise<{
        data: DashboardWasteCharacteristicsSummary[];
    }>;
}
