import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';

export default class GetEntityWasteBagSummaryByCharacteristicsExportUseCase {
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
    ): Promise<Buffer> {
        try {
            const data = await this.repo.getEntityWasteBagSummaryByCharacteristicsExport(
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
