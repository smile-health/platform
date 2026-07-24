import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetWasteGroupByAdminHealthcareFacilityUseCase {
    constructor(private readonly repo: DashboardRepository) {}

    async execute(
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
        data: DashboardWasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const data = await this.repo.getWasteGroupByAdminHealthcareFacility(
                limit,
                page,
                token,
                wasteTypeId,
                healthcareFacilityId,
                wasteGroupId,
                wasteCharacteristicsId,
                wasteStatus,
                search,
            );
            console.log('Fetched all summary waste hierarchy:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving data entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
