import DashboardRepository from '../../../domain/repositories/DashboardRepository';

export default class GetSummaryThisDayUseCase {
    constructor(private readonly repo: DashboardRepository) {}

    async execute(
        entityId: number
    ): Promise<{
        wasteBagOutResult: {
            totalBags: number;
            totalWeight: string;
        },
        wasteBagThisDay: {
            totalBags: number;
            totalWeight: string;
        }
    }> {
        try {
            const data = await this.repo.getSumaryPerDay(entityId);
            console.log('Fetched all summary waste hierarchy:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving data entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
