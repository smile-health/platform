import WasteTransportationExternalGroup from '../entities/WasteTransportationExternalGroup';

export default interface WasteTransportationExternalGroupRepository {
    createWasteTransportationExternalGroup(
        wasteBagIds: string[],
        wasteSource: WasteTransportationExternalGroup,
        entityId: number,
        providerType: string,
    ): Promise<WasteTransportationExternalGroup | null>;
    updateWasteTransportationExternalGroup(
        wasteSource: WasteTransportationExternalGroup,
    ): Promise<void | null>;
    getAllWasteTransportExternalGroup(
        limit: number,
        page: number,
        token: string,
        roles: string,
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
        treatment?:
            | 'TRANSPORTER_LANDFILL'
            | 'TRANSPORTER_RECYCLER'
            | 'TRANSPORTER_TREATMENT'
            | 'TRANSPORTER_GOVERNMENT'
            | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
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
    }>;
    getWasteTransportExternalGroupByIdWithWasteBags(
        token: string,
        id?: number,
        qrCodeId?: string,
    ): Promise<WasteTransportationExternalGroup | null>;
}
