import { DashboardWasteCharacteristicsSummary } from '../../../domain/entities/Dashboard';
import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetWasteCharacteSummaryUseCase {
    constructor(private readonly repo: DashboardRepository) {}
    async execute(
        wasteTypeId: number,
        provinceId?: number,
        cityId?: number,
        startDate?: string,
        endDate?: string,
        healthcareFacilityId?: number,
    ): Promise<{
        data: DashboardWasteCharacteristicsSummary[];
    }> {
        try {
            const wasteSources = await this.repo.getWasteCharacteristicsSummary(
                wasteTypeId,
                provinceId,
                cityId,
                startDate,
                endDate,
                healthcareFacilityId,
            );
            console.log(
                'Fetched all transaction GetSummaryWasteCharacteristicsUseCase successfully:',
                wasteSources,
            );
            return wasteSources;
        } catch (error) {
            console.error(
                'Error fetching transaction all GetSummaryWasteCharacteristicsUseCase:',
                error,
            );
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
