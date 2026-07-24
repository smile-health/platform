import { WasteBagLogBook } from '../../../domain/entities/WasteBagLogBook';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteBagLogBookUseCase {
  constructor(private readonly repo: ReportWasteBagRepository) {}
  async execute(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
    search?: string,
  ): Promise<{
    data: WasteBagLogBook[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const wasteSources = await this.repo.getWasteBagLogBook(
        limit,
        page,
        entityId,
        startDate,
        endDate,
        search,
      );

      return wasteSources;
    } catch (error) {
      console.error('Error fetching transaction all waste bag:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
