import WasteTransportationGroup from '../../../domain/entities/WasteTransportationGroup';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';

export default class GetAllWasteTransportationGroupUseCase {
    constructor(private readonly repo: WasteTransportationGroupRepository) {}

    async execute(
        limit: number,
        page: number,
        entityId?: number,
        date?: Date,
        status?:
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT'
            | 'READY_FOR_TREATMENT'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED',
    ): Promise<{
        data: WasteTransportationGroup[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repo.getAllWasteTransportationGroups(
                limit,
                page,
                entityId,
                date,
                status,
            );
            console.log('Fetched all waste sources successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
