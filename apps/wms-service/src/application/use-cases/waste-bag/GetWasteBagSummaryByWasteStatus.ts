import { WasteGroupDetails } from '../../../domain/entities/WasteBagLogBook';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteBagSummaryByWasteStatusUseCase {
  constructor(private readonly repo: ReportWasteBagRepository) {}
  async execute(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
  ): Promise<{
    data: WasteGroupDetails[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
  }> {
    try {
      const wasteSources = await this.repo.GetWasteBagSummaryByWasteStatus(
        limit,
        page,
        entityId,
        startDate,
        endDate,
      );
      return wasteSources;
    } catch (error) {
      console.error('Error fetching transaction all waste bag:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
