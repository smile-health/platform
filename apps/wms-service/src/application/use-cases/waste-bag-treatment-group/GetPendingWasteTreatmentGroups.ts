import WasteTreatmentGroupRepository from '../../../domain/repositories/WasteBagTreatmentGroupRepository';
import WasteTreatmentGroup, {
    WasteTreatmentGroupSelectDto,
} from '../../../domain/entities/WasteBagTreatmentGroup';

export default class GetPendingWasteTreatmentGroupsUseCase {
    constructor(private readonly wasteSourceRepository: WasteTreatmentGroupRepository) {}

    async execute(
        limit: number,
        page: number,
        healthcareFacilityId: number,
    ): Promise<{
        data: WasteTreatmentGroupSelectDto[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.wasteSourceRepository.getPendingWasteTreatmentGroups(
                limit,
                page,
                healthcareFacilityId,
            );
            console.log('Fetched all waste sources successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
