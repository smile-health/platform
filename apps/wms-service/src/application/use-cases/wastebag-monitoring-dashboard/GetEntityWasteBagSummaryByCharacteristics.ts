import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetEntityWasteBagSummaryByCharacteristicsUseCase {
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
            wasteFullName: string;
            value: number;
            avgValue: number;
            maxValue: number;
            gapValue: number;
        }>;
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const data = await this.repo.getEntityWasteBagSummaryByCharacteristics(
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
                lang
            );
            console.log('Fetched getEntityWasteBagSummaryByCharacteristics:', data);
            return data;
        } catch (error) {
            console.error('Error getEntityWasteBagSummaryByCharacteristics:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
