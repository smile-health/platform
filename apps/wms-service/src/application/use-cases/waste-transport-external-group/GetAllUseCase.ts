import WasteTransportationExternalGroup from '../../../domain/entities/WasteTransportationExternalGroup';
import WasteBagTransportationExternalGroupImpl from '../../../infrastructure/database/repositories/WasteBagTransportExternalGroupImpl';

export default class GetAllWasteTransportExternalGroupUseCase {
    constructor(private readonly wasteSourceRepository: WasteBagTransportationExternalGroupImpl) {}

    async execute(
        limit: number,
        page: number,
        token: string,
        roles?: string,
        entityId?: number,
        startDate?: Date,
        endDate?: Date,
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
        anotherStatus?:
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
        treatment?: 'TRANSPORTER_LANDFILL' | 'TRANSPORTER_RECYCLER' | 'TRANSPORTER_TREATMENT' | 'TRANSPORTER_GOVERNMENT' | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
            | 'SPECIALIZED_TREATMENT_PROVIDER',
        treatmentMethod?: string,
        healthcareFacilityId?: number,
        transportationStatus?: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED' | 'IN_TRANSIT',
    ): Promise<{
        data: WasteTransportationExternalGroup[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.wasteSourceRepository.getAllWasteTransportExternalGroup(
                limit,
                page,
                token,
                roles,
                entityId,
                startDate,
                endDate,
                status,
                anotherStatus,
                treatment,
                treatmentMethod,
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
