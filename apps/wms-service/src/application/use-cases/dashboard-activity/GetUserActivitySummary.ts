import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import DashboardActivityRepository from '../../../domain/repositories/DashboardActivityRepository';

export default class GetUserActivitySummaryUseCase {
  constructor(private readonly repo: DashboardActivityRepository) {}

  async execute(
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
    totalEntities: number;
    activeEntities: number;
    inactiveEntities: number;
  }> {
    try {
      const data = await this.repo.getUserActivitySummary(
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
      console.error('Error retrieving data getUserActivitySummary:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
