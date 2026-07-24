import DashboardActivityRepository from '../../../domain/repositories/DashboardActivityRepository';

export default class GetActivitySummariesForEntitiesExportUseCase {
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
    ): Promise<Buffer> {
        try {
            const result = await this.repo.getActivitySummariesForEntitiesExport(
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
            console.log('Activity summaries export generated successfully');
            return result;
        } catch (error) {
            console.error('Error exporting activity summaries:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
