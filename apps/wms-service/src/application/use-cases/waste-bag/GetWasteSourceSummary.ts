import { WasteSourceSummary } from '../../../domain/entities/WasteBagTrackingHistory';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteSourceSummaryUseCase {
  constructor(private readonly repo: ReportWasteBagRepository) {}

  async execute(
    limit: number,
    page: number,
    startDate: string,
    endDate: string,
    healthcareId?: number,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: WasteSourceSummary[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
    summary: {
      totalInternal: number;
      totalInternalTreatment: number;
      totalExternal: number;
    };
  }> {
    try {
      const wasteSources = await this.repo.getWasteSourceSummary(
        limit,
        page,
        startDate,
        endDate,
        healthcareId,
        provinceId,
        cityId,
      );
      return wasteSources;
    } catch (error) {
      console.error('Error fetching transaction all waste bag:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
