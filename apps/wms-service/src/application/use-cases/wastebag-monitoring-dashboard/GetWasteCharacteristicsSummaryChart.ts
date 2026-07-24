import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetWasteCharacteristicsSummaryChartUseCase {
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
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    > {
        try {
            const data = await this.repo.getWasteCharacteristicsSummaryChart(
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
                lang
            );
            console.log('Fetched all getWasteCharacteristicsSummaryChart:', data);
            return data;
        } catch (error) {
            console.error('Error getWasteCharacteristicsSummaryChart:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
