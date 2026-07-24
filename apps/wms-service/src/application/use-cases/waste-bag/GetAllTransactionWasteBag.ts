import ReportTransactionWasteBag from '../../../domain/entities/TransactionWasteBag';
import ReportWasteBagRepositoryImpl from '../../../infrastructure/database/repositories/ReportWasteBagRepositoryImpl';

export default class GetAllTransactionWasteBagUseCase {
  constructor(private readonly repo: ReportWasteBagRepositoryImpl) {}

  async execute(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
    search?: string,
    healthcareId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    transporterId?: number,
    treatmentStatus?: string,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: ReportTransactionWasteBag[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const wasteSources = await this.repo.getAllTransactionWasteBagRaw(
        limit,
        page,
        startDate,
        endDate,
        search,
        healthcareId,
        wasteTypeId,
        wasteGroupId,
        wasteCharacteristicsId,
        transporterId,
        treatmentStatus,
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
