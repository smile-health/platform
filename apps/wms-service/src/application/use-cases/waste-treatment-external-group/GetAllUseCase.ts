import WasteTreatmentExternalGroupRepository from '../../../domain/repositories/WasteTreatmentExternalGroupRepository';
import WasteTreatmentExternalGroup from '../../../domain/entities/WasteTreatmentExternalGroup';

export default class GetAllWasteTreatmentExternalGroupUseCase {
    constructor(private readonly wasteSourceRepository: WasteTreatmentExternalGroupRepository) {}

    async execute(
        limit: number,
        page: number,
        token: string,
        entityId?: number,
        startDate?: Date,
        endDate?: Date,
        status?: string,
        roles?: 'operator_landfill' | 'operator_treatment' | 'operator_recycler' | 'operator_waste_bank',
        healthcareFacilityId?: number,
        transportationStatus?:
            | 'STORED_FOR_TREATMENT'
            | 'READY_FOR_TREATMENT'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'LANDFILLED'
            | 'RECYCLED'
            | 'DISPOSED'
            | 'COLLECTED',
    ): Promise<{
        data: WasteTreatmentExternalGroup[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.wasteSourceRepository.getAllWasteTreatmentExternalGroup(
                limit,
                page,
                token,
                entityId,
                startDate,
                endDate,
                status,
                roles,
                healthcareFacilityId,
                transportationStatus,
            );

            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
