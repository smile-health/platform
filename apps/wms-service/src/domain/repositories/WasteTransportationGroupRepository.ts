import WasteTransportationGroup from '../entities/WasteTransportationGroup';
import { WasteClassificationAttributes } from '../../infrastructure/database/models/WasteClassificationModel';

export default interface WasteTransportationGroupRepository {
    createWasteTransportationGroup(
        wasteBagIds: string[],
        wasteSource: WasteTransportationGroup,
        entityId: number,
        providerType: string,
    ): Promise<WasteTransportationGroup | null>;
    updateWasteTransportationGroup(wasteSource: WasteTransportationGroup): Promise<void | null>;
    deleteWasteTransportationGroup(id: string, deletedBy?: number): Promise<boolean | null>;
    getWasteTransportationGroupById(
        token: string,
        id?: string,
        qrCodeId?: string,
    ): Promise<WasteTransportationGroup | null>;
    getWasteBagTransportGroupById(id: number): Promise<WasteTransportationGroup | null>;
    getWasteBagTransportGroupByIds(ids: number[]): Promise<WasteTransportationGroup[]>;
    getAllWasteTransportationGroups(
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
    }>;
}
