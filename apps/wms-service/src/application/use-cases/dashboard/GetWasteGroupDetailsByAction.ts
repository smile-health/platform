import { DashboardWasteGroupDetailsByAction } from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetWasteGroupDetailsByActionUseCase {
    constructor(private readonly repo: DashboardRepository) {}
    async execute(
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
    }> {
        try {
            const wasteSources = await this.repo.getWasteGroupDetailsByAction(
                limit,
                page,
                wasteGroupId,
                treatmentType,
            );
            console.log('Fetched all transaction waste bag successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching transaction all waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
