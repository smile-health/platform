import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import DashboardActivityRepository from '../../../domain/repositories/DashboardActivityRepository';

export default class GetActivitySummariesForEntitiesUseCase {
  constructor(private readonly repo: DashboardActivityRepository) {}

  async execute(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    entityTag?: string,
    typeOfProcessing?: string,
  ): Promise<{
    data: DashboardWasteHierarchy[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const data = await this.repo.getActivitySummariesForEntities(
        limit,
        page,
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        wasteTypeId,
        wasteGroupId,
        entityTag,
        typeOfProcessing,
      );

      return data;
    } catch (error) {
      console.error('Error retrieving data entity location:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
