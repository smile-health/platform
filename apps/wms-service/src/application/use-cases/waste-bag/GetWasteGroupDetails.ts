import { WasteGroupDetails } from '../../../domain/entities/WasteBagLogBook';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteGroupDetailsUseCase {
    constructor(private readonly repo: ReportWasteBagRepository) {}
    async execute(
        limit: number,
        page: number,
        wasteGroupId: number,
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
            const wasteSources = await this.repo.getWasteGroupDetails(limit, page, wasteGroupId);
            console.log('Fetched all transaction waste bag successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching transaction all waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
