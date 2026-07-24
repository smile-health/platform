import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetWasteGroupSummaryChartUseCase {
    constructor(private readonly repo: WasteBagMonitoringDashboardRepository) {}

    async execute(
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
        lang?: string,
    ): Promise<{
        total: number;
        data: Array<{
            labelType: string;
            label: string;
            value: number;
        }>;
    }> {
        try {
            const data = await this.repo.getWasteGroupSummaryChart(
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
                lang,
            );
            console.log('Fetched all getWasteGroupSummaryChart:', data);
            return data;
        } catch (error) {
            console.error('Error getWasteGroupSummaryChart:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
