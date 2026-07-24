import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetEntityWasteBagSummaryChartUseCase {
    constructor(private readonly repo: WasteBagMonitoringDashboardRepository) {}

    async execute(
        limit?: number,
        page?: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string,
    ): Promise<{
        data: Array<{
            provinceName?: string;
            regencyName?: string;
            healthcareFacilityName: string;
            value: number;
        }>;
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const data = await this.repo.getEntityWasteBagSummaryChart(
                limit,
                page,
                startDate,
                endDate,
                provinceId,
                regencyId,
                healthcareFacilityId,
                tag,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
                isBags,
                orderBy
            );
            console.log('Fetched all getEntityWasteBagSummaryChart:', data);
            return data;
        } catch (error) {
            console.error('Error getEntityWasteBagSummaryChart:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
