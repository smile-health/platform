import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetSummaryWasteHierarchyByCityUseCase {
    constructor(private readonly repo: DashboardRepository) {}

    async execute(
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
    }> {
        try {
            const data = await this.repo.getSummaryWasteHierarchyByCity(
                limit,
                page,
                token,
                cityId,
                startDate,
                endDate,
                healthcareFacilityId,
            );
            console.log('Fetched all summary waste hierarchy:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving data entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
