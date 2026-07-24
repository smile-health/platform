import { DashboardThirdParty } from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetWasteGroupByTransporterUseCase {
    constructor(private readonly repo: DashboardRepository) {}

    async execute(
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
    }> {
        try {
            const data = await this.repo.getWasteGroupByTransporter(
                limit,
                page,
                token,
                entityId,
                healthcareFacilityId,
                provinceId,
                cityId,
                startDate,
                endDate,
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
