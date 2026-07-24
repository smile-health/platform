import { WasteBagModelAttributes } from '../../infrastructure/database/models/WasteBagModel';
import WasteTreatmentExternalGroup from '../entities/WasteTreatmentExternalGroup';
export default interface WasteTreatmentExternalGroupRepository {
    createWasteTreatmentExternalGroup(
        wasteTransportationExternalGroupIds: number[],
        createdBy: string,
        entityId: number,
    ): Promise<
        Array<{
            id: number;
            transportationGroupId: number;
        }> | string
    >;
    receieveWasteTreatmentExternalGroup(
        qrCodeId: string[],
        createdBy: string,
        entityId: number,
    ): Promise<
        | {
              id: number;
              wasteBag: WasteBagModelAttributes;
          }
        | string
    >;
    getWasteTreatmentExternalGroupByIdWithWasteBags(
        token: string,
        id?: number,
        qrCodeId?: string,
    ): Promise<WasteTreatmentExternalGroup | null>;
    getAllWasteTreatmentExternalGroup(
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
    }>;
    updateWasteTreatmentGroup(
        id: number,
        status: 'RECYCLED' | 'LANDFILLED' | 'COLLECTED' | 'DISPOSED',
    ): Promise<void>;
}
