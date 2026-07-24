import { WasteBagSummaryByCharacteristics } from '../../../domain/entities/WasteBagTrackingHistory';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteBagSummaryByCharacteristicsUseCase {
  constructor(private readonly repo: ReportWasteBagRepository) {}

  async execute(
    limit: number,
    page: number,
    startDate: string,
    endDate: string,
    includeWasteStatus?: boolean,
    healthcareId?: number,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: WasteBagSummaryByCharacteristics[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
  }> {
    try {
      const wasteSources = await this.repo.getWasteBagSummaryByCharacteristics(
        limit,
        page,
        startDate,
        endDate,
        includeWasteStatus,
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
