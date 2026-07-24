import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetProvinceWasteBagSummaryChartUseCase {
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
        orderBy?: string,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    > {
        try {
            const data = await this.repo.getProvinceWasteBagSummaryChart(
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
            console.log('Fetched all getMonthlyWasteBagSummaryChart:', data);
            return data;
        } catch (error) {
            console.error('Error getMonthlyWasteBagSummaryChart:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
