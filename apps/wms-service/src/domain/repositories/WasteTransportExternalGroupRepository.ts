import { WasteBagModelAttributes } from '../../infrastructure/database/models/WasteBagModel';
import WasteTransportationExternalGroup from '../entities/WasteTransportationExternalGroup';

export default interface WasteTransportExternalGroupRepository {
    createWasteTransportExternalGroup(
        qrCodeId: string,
        createdBy: string,
        entityId: number,
    ): Promise<{
        id: number;
        wasteBag: WasteBagModelAttributes;
    }>;
    getWasteTransportExternalGroupByIdWithWasteBags(
        token: string,
        id?: number,
        qrCodeId?: string,
    ): Promise<WasteTransportationExternalGroup | null>;
    getAllWasteTransportExternalGroup(
        limit: number,
        page: number,
        token: string,
        entityId?: number,
        status?:
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
        data: WasteTransportationExternalGroup[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    updateWasteTransportGroup(
        id: number,
        status: 'RECYCLED' | 'LANDFILLED' | 'COLLECTED' | 'DISPOSED',
    ): Promise<void>;
}
