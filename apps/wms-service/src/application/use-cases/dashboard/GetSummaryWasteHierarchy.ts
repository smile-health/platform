import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetSummaryWasteHierarchyUseCase {
    constructor(private readonly repo: DashboardRepository) {}

    async execute(
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
    }> {
        try {
            const data = await this.repo.getSummaryWasteHierarchy(limit, page, startDate, endDate);
            console.log('Fetched all summary waste hierarchy:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving data entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
