import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetMonthlyWasteBagSummaryChartUseCase {
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
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    > {
        try {
            const data = await this.repo.getMonthlyWasteBagSummaryChart(
                startDate,
                endDate,
                provinceId,
                regencyId,
                healthcareFacilityId,
                tag,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
                isBags
            );
            console.log('Fetched all getMonthlyWasteBagSummaryChart:', data);
            return data;
        } catch (error) {
            console.error('Error getMonthlyWasteBagSummaryChart:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
