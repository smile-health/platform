import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetEntityWasteBagSummaryByGroupUseCase {
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
        lang?: string,
    ): Promise<{
        data: Array<{
            provinceName?: string;
            regencyName?: string;
            healthcareFacilityName: string;
            wasteGroupName: string;
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
            const data = await this.repo.getEntityWasteBagSummaryByGroup(
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
                orderBy,
                lang,
            );
            console.log('Fetched getEntityWasteBagSummaryByGroup:', data);
            return data;
        } catch (error) {
            console.error('Error getEntityWasteBagSummaryByGroup:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
