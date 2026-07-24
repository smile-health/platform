import ManualScaleRequest from '../../../domain/entities/ManualScaleRequest';
import ManualScaleRequestRepository from '../../../domain/repositories/ManualScaleRequestRepository';

export default class GetAllManualScaleRequestUseCase {
  constructor(private readonly repo: ManualScaleRequestRepository) {}
  async execute(
    limit: number,
    page: number,
    token: string,
    entityId?: number,
    status?: string,
    isActive?: boolean,
    provinceId?: number,
    cityId?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: ManualScaleRequest[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const data = await this.repo.getAllManualRequest(
        limit,
        page,
        token,
        entityId,
        status,
        isActive,
        provinceId,
        cityId,
        startDate,
        endDate,
      );

      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Error fetching data');
    }
  }
}
