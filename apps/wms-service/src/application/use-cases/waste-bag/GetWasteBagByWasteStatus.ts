import { WasteGroupDetails } from '../../../domain/entities/WasteBagLogBook';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteBagByWasteStatusUseCase {
    constructor(private readonly repo: ReportWasteBagRepository) {}
    async execute(
        limit: number,
        page: number,
        entityId: number,
        startDate: string,
        endDate: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteStatus?: string,
        lang?: string,
    ): Promise<{
        data: WasteGroupDetails[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repo.GetWasteBagByWasteStatus(
                limit,
                page,
                entityId,
                startDate,
                endDate,
                wasteTypeId,
                wasteGroupId,
                wasteStatus,
                lang,
            );
            console.log('Fetched all transaction waste bag successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching transaction all waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
